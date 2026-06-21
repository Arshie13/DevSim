import { CLOUDFLARE_API_TOKEN, CLOUDFLARE_TUNNEL_ID, CLOUDFLARE_ACCOUNT_ID } from '$env/static/private';

const CF_API = 'https://api.cloudflare.com/client/v4';

export class CloudflaredWrapper {
  private apiToken: string;
  private tunnelId: string;
  private accountId: string;

  private tunnelLock: Promise<void> = Promise.resolve();

  constructor() {
    this.apiToken = CLOUDFLARE_API_TOKEN;
    this.tunnelId = CLOUDFLARE_TUNNEL_ID;
    this.accountId = CLOUDFLARE_ACCOUNT_ID;
  }

  private get headers() {
    return {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
    };
  }

  private async acquireTunnelLock(): Promise<() => void> {
    let release: () => void;
    const wait = new Promise<void>(resolve => { release = resolve; });
    const prev = this.tunnelLock;
    this.tunnelLock = prev.then(() => wait);
    await prev;
    return release!;
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

    await this.addTunnelRoute(hostname, serviceUrl);

    return `https://${hostname}`;
  }

  /**
   * Remove tunnel route and DNS record on container stop
   */
  async removeRoute(hostname: string): Promise<void> {
    await this.deleteTunnelRoute(hostname);
  }

  /**
   * checks if route alreaty exists
   */
  async getExistingRoute(hostname: string): Promise<string | null> {
    const res = await fetch(
      `${CF_API}/accounts/${this.accountId}/cfd_tunnel/${this.tunnelId}/configurations`,
      { method: 'GET', headers: this.headers }
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Cloudflare API error ${res.status}: ${body.slice(0, 200)}`);
    }

    const data = await res.json();
    const ingress = data.result?.config?.ingress ?? [];

    const match = ingress.find((rule: any) => rule.hostname === hostname);
    return match?.service ?? null;
  }

  private async addTunnelRoute(hostname: string, service: string): Promise<void> {
    const unlock = await this.acquireTunnelLock();
    try {
      const res = await fetch(
        `${CF_API}/accounts/${this.accountId}/cfd_tunnel/${this.tunnelId}/configurations`,
        {
          method: 'GET',
          headers: this.headers,
        }
      );

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Cloudflare API error ${res.status}: ${body.slice(0, 200)}`);
      }

      const data = await res.json();
      const config = data.result?.config ?? { ingress: [] };

      config.ingress = config.ingress.filter(
        (rule: any) => rule.hostname !== hostname
      );

      const catchAll = config.ingress.find((r: any) => !r.hostname);
      const rules = config.ingress.filter((r: any) => r.hostname);

      config.ingress = [
        ...rules,
        { hostname, service },
        catchAll ?? { service: 'http_status:404' },
      ];

      const putRes = await fetch(
        `${CF_API}/accounts/${this.accountId}/cfd_tunnel/${this.tunnelId}/configurations`,
        {
          method: 'PUT',
          headers: this.headers,
          body: JSON.stringify({ config }),
        }
      );

      if (!putRes.ok) {
        const body = await putRes.text();
        throw new Error(`Cloudflare API error ${putRes.status}: ${body.slice(0, 200)}`);
      }
    } finally {
      unlock();
    }
  }

  private async deleteTunnelRoute(hostname: string): Promise<void> {
    const unlock = await this.acquireTunnelLock();
    try {
      const res = await fetch(
        `${CF_API}/accounts/${this.accountId}/cfd_tunnel/${this.tunnelId}/configurations`,
        { method: 'GET', headers: this.headers }
      );

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Cloudflare API error ${res.status}: ${body.slice(0, 200)}`);
      }

      const data = await res.json();
      const config = data.result?.config ?? { ingress: [] };

      config.ingress = config.ingress.filter(
        (rule: any) => rule.hostname !== hostname
      );

      const putRes = await fetch(
        `${CF_API}/accounts/${this.accountId}/cfd_tunnel/${this.tunnelId}/configurations`,
        {
          method: 'PUT',
          headers: this.headers,
          body: JSON.stringify({ config }),
        }
      );

      if (!putRes.ok) {
        const body = await putRes.text();
        throw new Error(`Cloudflare API error ${putRes.status}: ${body.slice(0, 200)}`);
      }
    } finally {
      unlock();
    }
  }

}