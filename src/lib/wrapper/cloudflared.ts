import { CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID, CLOUDFLARE_TUNNEL_ID, CLOUDFLARE_ACCOUNT_ID } from '$env/static/private';

const CF_API = 'https://api.cloudflare.com/client/v4';

export class CloudflaredWrapper {
  private apiToken: string;
  private zoneId: string;
  private tunnelId: string;
  private accountId: string;

  constructor() {
    this.apiToken = CLOUDFLARE_API_TOKEN;
    this.zoneId = CLOUDFLARE_ZONE_ID;
    this.tunnelId = CLOUDFLARE_TUNNEL_ID;
    this.accountId = CLOUDFLARE_ACCOUNT_ID;
  }

  private get headers() {
    return {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Create a tunnel route: hostname -> local service
   * e.g. "alice.devsim.dev" -> "http://127.0.0.1:32768"
   */
  async createRoute(hostname: string, localPort: number): Promise<string> {
    const serviceUrl = `http://127.0.0.1:${localPort}`;

    const existing = await this.getExistingRoute(hostname);

    if (existing === serviceUrl) {
      // Same port, nothing to do
      return `https://${hostname}`;
    }

    // New or changed port — update tunnel + DNS
    await this.addTunnelRoute(hostname, serviceUrl);

    if (!existing) {
      // Only create DNS record if it doesn't exist yet
      await this.createDnsRecord(hostname);
    }

    return `https://${hostname}`;
  }

  /**
   * Remove tunnel route and DNS record on container stop
   */
  async removeRoute(hostname: string): Promise<void> {
    await this.deleteTunnelRoute(hostname);
    await this.deleteDnsRecord(hostname);
  }

  /**
   * checks if route alreaty exists
   */
  async getExistingRoute(hostname: string): Promise<string | null> {
    const res = await fetch(
      `${CF_API}/accounts/${this.accountId}/cfd_tunnel/${this.tunnelId}/configurations`,
      { method: 'GET', headers: this.headers }
    );

    const data = await res.json();
    const ingress = data.result?.config?.ingress ?? [];

    const match = ingress.find((rule: any) => rule.hostname === hostname);
    return match?.service ?? null;
  }

  private async addTunnelRoute(hostname: string, service: string): Promise<void> {
    const res = await fetch(
      `${CF_API}/accounts/${this.accountId}/cfd_tunnel/${this.tunnelId}/configurations`,
      {
        method: 'GET',
        headers: this.headers,
      }
    );

    const data = await res.json();
    const config = data.result?.config ?? { ingress: [] };

    // Remove existing route for this hostname if any
    config.ingress = config.ingress.filter(
      (rule: any) => rule.hostname !== hostname
    );

    // Add new route before the catch-all
    const catchAll = config.ingress.find((r: any) => !r.hostname);
    const rules = config.ingress.filter((r: any) => r.hostname);

    config.ingress = [
      ...rules,
      { hostname, service },
      catchAll ?? { service: 'http_status:404' }, // ensure catch-all exists
    ];

    await fetch(
      `${CF_API}/accounts/${this.accountId}/cfd_tunnel/${this.tunnelId}/configurations`,
      {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify({ config }),
      }
    );
  }

  private async deleteTunnelRoute(hostname: string): Promise<void> {
    const res = await fetch(
      `${CF_API}/accounts/${this.accountId}/cfd_tunnel/${this.tunnelId}/configurations`,
      { method: 'GET', headers: this.headers }
    );

    const data = await res.json();
    const config = data.result?.config ?? { ingress: [] };

    config.ingress = config.ingress.filter(
      (rule: any) => rule.hostname !== hostname
    );

    await fetch(
      `${CF_API}/accounts/${this.accountId}/cfd_tunnel/${this.tunnelId}/configurations`,
      {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify({ config }),
      }
    );
  }

  private async createDnsRecord(hostname: string): Promise<void> {
    const subdomain = hostname.split('.')[0]; // e.g. "alice"

    await fetch(`${CF_API}/zones/${this.zoneId}/dns_records`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        type: 'CNAME',
        name: subdomain,
        content: `${this.tunnelId}.cfargotunnel.com`,
        proxied: true,
        ttl: 1, // Auto TTL when proxied
      }),
    });
  }

  private async deleteDnsRecord(hostname: string): Promise<void> {
    const subdomain = hostname.split('.')[0];

    // Find the record ID first
    const res = await fetch(
      `${CF_API}/zones/${this.zoneId}/dns_records?type=CNAME&name=${subdomain}.devsim.dev`,
      { method: 'GET', headers: this.headers }
    );

    const data = await res.json();
    const recordId = data.result?.[0]?.id;

    if (recordId) {
      await fetch(`${CF_API}/zones/${this.zoneId}/dns_records/${recordId}`, {
        method: 'DELETE',
        headers: this.headers,
      });
    }
  }

  // TODO: stop tunnel if user exits
}