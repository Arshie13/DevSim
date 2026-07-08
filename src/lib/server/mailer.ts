const SUPPORT_EMAIL = process.env.SMTP_USER;

interface HelpEmailPayload {
	userEmail: string;
	category?: string | null;
	subject: string;
	description: string;
	context?: unknown;
}

async function getTransporter() {
	const host = process.env.SMTP_HOST;
	const port = process.env.SMTP_PORT;
	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASS;

	if (!host || !port || !user || !pass) {
		return null;
	}

	const nodemailer = await import('nodemailer');
	return nodemailer.default.createTransport({
		host,
		port: Number(port),
		secure: Number(port) === 465,
		auth: { user, pass }
	});
}

export async function sendHelpEmail(payload: HelpEmailPayload): Promise<boolean> {
	const transporter = await getTransporter();

	if (!transporter) {
		console.warn('[mailer] SMTP not configured — skipping email for help request:', payload.subject);
		return false;
	}

	try {
		await transporter.sendMail({
			from: process.env.SMTP_USER,
			to: SUPPORT_EMAIL,
			replyTo: payload.userEmail,
			subject: `[Help Request] ${payload.subject}`,
			html: `
				<h2>Help Request</h2>
				<p><strong>From:</strong> ${escapeHtml(payload.userEmail)}</p>
				<p><strong>Category:</strong> ${escapeHtml(payload.category || 'Uncategorized')}</p>
				<p><strong>Subject:</strong> ${escapeHtml(payload.subject)}</p>
				<p><strong>Description:</strong></p>
				<pre>${escapeHtml(payload.description)}</pre>
				<p><strong>Context:</strong></p>
				<pre>${escapeHtml(JSON.stringify(payload.context ?? {}, null, 2))}</pre>
			`
		});
		return true;
	} catch (err) {
		console.error('[mailer] Failed to send help email:', err);
		return false;
	}
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}
