const COMMAND_BLACKLIST: Array<{ pattern: RegExp; reason: string }> = [
  { pattern: /^vimi?$/, reason: 'Text editors are not allowed' },
  { pattern: /^nano$/, reason: 'Text editors are not allowed' },
  { pattern: /^emacs$/, reason: 'Text editors are not allowed' },
  { pattern: /^nvim$/, reason: 'Text editors are not allowed' },
  { pattern: /^ed$/, reason: 'Text editors are not allowed' },
  { pattern: /^visudo$/, reason: 'Text editors are not allowed' },

  { pattern: /^sudo\b/, reason: 'Privilege escalation not allowed' },
  { pattern: /^su\b/, reason: 'Privilege escalation not allowed' },
  { pattern: /^doas\b/, reason: 'Privilege escalation not allowed' },

  { pattern: /^rm\s+-r[f]?\s+\/$/, reason: 'Cannot remove root filesystem' },
  { pattern: /^rm\s+-r[f]?\s+\/\*/, reason: 'Cannot remove root filesystem' },
  { pattern: /^rm\s+-r[f]?\s+~\/?$/, reason: 'Cannot remove home directory' },
  { pattern: /^rm\s+-r[f]?\s+\/workspace\/?$/, reason: 'Cannot remove workspace' },
  { pattern: /^rm\s+-[a-zA-Z]*r[a-zA-Z]*f/, reason: 'Recursive force delete not allowed' },
  { pattern: /^dd\b/, reason: 'Disk operations not allowed' },
  { pattern: /^mkfs/, reason: 'Filesystem formatting not allowed' },
  { pattern: /^fdisk\b/, reason: 'Disk partitioning not allowed' },
  { pattern: /^parted\b/, reason: 'Disk partitioning not allowed' },
  { pattern: /^blkid$/, reason: 'Disk operations not allowed' },
  { pattern: /^wipefs\b/, reason: 'Disk operations not allowed' },

  { pattern: /^reboot$/, reason: 'System control not allowed' },
  { pattern: /^shutdown/, reason: 'System control not allowed' },
  { pattern: /^poweroff$/, reason: 'System control not allowed' },
  { pattern: /^halt$/, reason: 'System control not allowed' },
  { pattern: /^init\s+[06]$/, reason: 'System control not allowed' },

  { pattern: /^systemctl\b/, reason: 'Service management not allowed' },
  { pattern: /^service\b/, reason: 'Service management not allowed' },

  { pattern: /^docker\b/, reason: 'Container commands not allowed' },
  { pattern: /^podman\b/, reason: 'Container commands not allowed' },
  { pattern: /^kubectl\b/, reason: 'Container commands not allowed' },
  { pattern: /^containerd\b/, reason: 'Container commands not allowed' },

  { pattern: /^ssh\b/, reason: 'Remote access not allowed' },
  { pattern: /^scp\b/, reason: 'Remote access not allowed' },
  { pattern: /^sftp\b/, reason: 'Remote access not allowed' },

  { pattern: /^mount\s/, reason: 'Filesystem mounting not allowed' },
  { pattern: /^umount\s/, reason: 'Filesystem mounting not allowed' },
  { pattern: /^mount$/, reason: 'Filesystem mounting not allowed' },
  { pattern: /^umount$/, reason: 'Filesystem mounting not allowed' },

  { pattern: /^crontab\b/, reason: 'Scheduled tasks not allowed' },
  { pattern: /^at\b/, reason: 'Scheduled tasks not allowed' },

  { pattern: /:\s*\(\s*\)\s*\{.*\|.*&.*\}\s*;/, reason: 'Fork bomb not allowed' },

  { pattern: /^iptables\b/, reason: 'Network manipulation not allowed' },
  { pattern: /^nft\b/, reason: 'Network manipulation not allowed' },
  { pattern: /^ifconfig\b/, reason: 'Network manipulation not allowed' },

  { pattern: /^chown\s+root/, reason: 'Ownership change not allowed' },
  { pattern: /^chmod\s+(777|000|077)/, reason: 'Dangerous permission change not allowed' },
];

function extractCommand(input: string): string {
  const trimmed = input.trim().replace(/\s+/g, ' ');
  if (!trimmed) return '';

  const firstSpace = trimmed.indexOf(' ');
  const cmdWithFlags = firstSpace === -1 ? trimmed : trimmed.substring(0, firstSpace);
  const lastSlash = cmdWithFlags.lastIndexOf('/');
  const cmd = lastSlash !== -1 ? cmdWithFlags.substring(lastSlash + 1) : cmdWithFlags;

  return cmd.toLowerCase();
}

export function checkCommandBlacklist(input: string): { blocked: boolean; reason?: string } {
  const trimmed = input.trim().replace(/\s+/g, ' ');
  if (!trimmed) return { blocked: false };

  const cmd = extractCommand(trimmed);

  for (const entry of COMMAND_BLACKLIST) {
    if (entry.pattern.test(cmd)) {
      return { blocked: true, reason: entry.reason };
    }
  }

  for (const entry of COMMAND_BLACKLIST) {
    if (entry.pattern.test(trimmed)) {
      return { blocked: true, reason: entry.reason };
    }
  }

  return { blocked: false };
}
