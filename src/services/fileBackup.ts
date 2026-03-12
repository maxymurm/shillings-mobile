import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { db } from '@/offline/database';

export async function exportBackup(): Promise<string> {
  const accounts = await db.accounts.toArray();
  const transactions = await db.transactions.toArray();
  const splits = await db.splits.toArray();
  const contacts = await db.contacts.toArray();

  const backup = {
    version: 1,
    exported_at: new Date().toISOString(),
    data: { accounts, transactions, splits, contacts },
  };

  const filename = `shillings-backup-${new Date().toISOString().split('T')[0]}.json`;
  const result = await Filesystem.writeFile({
    path: filename,
    data: JSON.stringify(backup),
    directory: Directory.Documents,
    encoding: Encoding.UTF8,
  });

  return result.uri;
}

export async function shareFile(uri: string, title: string): Promise<void> {
  await Share.share({ title, url: uri });
}
