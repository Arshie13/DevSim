import * as ngrok from '@ngrok/ngrok';

/**
 * Configuration options for ngrok tunnel
 */
export interface NgrokTunnelConfig {
	/** Local port to tunnel to */
	port: number;
	/** Optional subdomain for the tunnel */
	subdomain?: string;
	/** Optional auth token for authenticated tunnels */
	auth?: string;
	/** Additional ngrok options */
	options?: {
		proto?: 'http' | 'https' | 'tcp';
		bind_tls?: true | false;
		host_header?: string;
		metadata?: string;
	};
}

/**
 * Information about an active ngrok tunnel
 */
export interface TunnelInfo {
	/** The public URL of the tunnel */
	url: string;
	/** The tunnel ID */
	tunnelId: string;
	/** The protocol used */
	protocol: string;
}

/**
 * NgrokWrapper - A wrapper around ngrok for creating secure tunnels
 * 
 * @example
 * ```typescript
 * const tunnel = new NgrokWrapper();
 * 
 * // Start a tunnel
 * const info = await tunnel.connect({ port: 3000 });
 * console.log(`Tunnel URL: ${info.url}`);
 * 
 * // When done
 * await tunnel.disconnect();
 * ```
 */
export class NgrokWrapper {
	private listener: ngrok.Listener | null = null;
	private tunnelInfo: TunnelInfo | null = null;

	/**
	 * Connect to ngrok and create a tunnel
	 */
	async connect(config: NgrokTunnelConfig): Promise<TunnelInfo> {
		try {
			// Disconnect existing tunnel if any
			await this.disconnect();

			// Connect to ngrok
			this.listener = await ngrok.connect({
				addr: config.port,
				authtoken: process.env.NGROK_AUTHTOKEN,
				subdomain: config.subdomain,
				auth: config.auth,
				...config.options,
			});

			// Get the URL
			const url = this.listener.url();
			if (!url) {
				throw new Error('Failed to get tunnel URL');
			}

			// Determine protocol from URL
			const protocol = url.startsWith('https') ? 'https' : url.startsWith('http') ? 'http' : 'tcp';

			this.tunnelInfo = {
				url,
				tunnelId: this.listener.id(),
				protocol,
			};

			console.log(`🚀 Ngrok tunnel created: ${url}`);

			return this.tunnelInfo;
		} catch (error) {
			console.error('Failed to create ngrok tunnel:', error);
			throw new Error(`Ngrok connection failed: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	/**
	 * Disconnect the current tunnel
	 */
	async disconnect(): Promise<void> {
		try {
			if (this.listener) {
				this.listener.close();
				this.listener = null;
			}
			this.tunnelInfo = null;
			console.log('🔌 Ngrok tunnel closed');
		} catch (error) {
			console.error('Error disconnecting ngrok:', error);
			// Clear state even on error
			this.listener = null;
			this.tunnelInfo = null;
		}
	}

	/**
	 * Get information about the current tunnel
	 */
	getTunnelInfo(): TunnelInfo | null {
		return this.tunnelInfo;
	}

	/**
	 * Get the public URL of the current tunnel
	 */
	getUrl(): string | null {
		return this.tunnelInfo?.url ?? null;
	}

	/**
	 * Check if a tunnel is currently active
	 */
	isConnected(): boolean {
		return this.tunnelInfo !== null && this.listener !== null;
	}
}

/**
 * Create a new ngrok tunnel with the given configuration
 * 
 * @deprecated Use `new NgrokWrapper()` instead for better management
 */
export async function createTunnel(config: NgrokTunnelConfig): Promise<TunnelInfo> {
	const wrapper = new NgrokWrapper();
	return await wrapper.connect(config);
}

/**
 * Get the ngrok dashboard URL (if running)
 */
export function getDashboardUrl(): string | null {
	const apiKey = process.env.NGROK_API_KEY;
	if (!apiKey) {
		return null;
	}
	return 'https://dashboard.ngrok.com';
}

/**
 * Validate ngrok configuration
 */
export function validateConfig(): { valid: boolean; message: string } {
	const authToken = process.env.NGROK_AUTHTOKEN;
	
	if (!authToken) {
		return {
			valid: false,
			message: 'NGROK_AUTHTOKEN environment variable is not set. Get your token from https://dashboard.ngrok.com/',
		};
	}

	return {
		valid: true,
		message: 'Ngrok configuration is valid',
	};
}
