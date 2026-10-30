import SettingsForm from '@/components/admin/SettingsForm';
import { getSettings } from '@/lib/db';

export default function AdminSettings() {
  return (
    <div className="adm__main">
      <h1>Настройки</h1>
      <SettingsForm settings={getSettings()} />
    </div>
  );
}
