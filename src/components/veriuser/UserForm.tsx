import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { User, Patent, Status, Category } from './types';

interface UserFormProps {
  editingUser: User | null;
  statuses: Status[];
  categories: Category[];
  onSubmit: (formData: any, patents: Patent[]) => void;
  onCancel: () => void;
}

const UserForm = ({ editingUser, statuses, categories, onSubmit, onCancel }: UserFormProps) => {
  const [formData, setFormData] = useState({
    owner: '',
    username: '',
    channelOrProfile: '',
    age: '',
    reason: '',
    status: '',
    statusNote: '',
    otherSocialNetworks: '',
  });

  const [patents, setPatents] = useState<Patent[]>([{ id: '1', text: '' }]);

  useEffect(() => {
    if (editingUser) {
      setFormData({
        owner: editingUser.owner,
        username: editingUser.username,
        channelOrProfile: editingUser.channelOrProfile,
        age: editingUser.age,
        reason: editingUser.reason,
        status: editingUser.status,
        statusNote: editingUser.statusNote,
        otherSocialNetworks: editingUser.otherSocialNetworks,
      });
      setPatents(editingUser.patents.length > 0 ? editingUser.patents : [{ id: '1', text: '' }]);
    } else {
      setFormData({
        owner: '',
        username: '',
        channelOrProfile: '',
        age: '',
        reason: '',
        status: '',
        statusNote: '',
        otherSocialNetworks: '',
      });
      setPatents([{ id: '1', text: '' }]);
    }
  }, [editingUser]);

  const handleAddPatent = () => {
    setPatents([...patents, { id: Date.now().toString(), text: '' }]);
  };

  const handleRemovePatent = (id: string) => {
    if (patents.length > 1) {
      setPatents(patents.filter(p => p.id !== id));
    }
  };

  const handlePatentChange = (id: string, text: string) => {
    setPatents(patents.map(p => p.id === id ? { ...p, text } : p));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, patents);
  };

  return (
    <Card className="max-w-3xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="UserPlus" size={24} />
          {editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="owner">Владелец *</Label>
              <Input
                id="owner"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                placeholder="Иван Иванов"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-gray-50 text-gray-500">@</span>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="username"
                  className="rounded-l-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channelOrProfile">Канал/Профиль</Label>
              <Input
                id="channelOrProfile"
                value={formData.channelOrProfile}
                onChange={(e) => setFormData({ ...formData, channelOrProfile: e.target.value })}
                placeholder="t.me/channel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Возраст</Label>
              <Input
                id="age"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="25 лет"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="otherSocialNetworks">Другие социальные сети</Label>
            <Textarea
              id="otherSocialNetworks"
              value={formData.otherSocialNetworks}
              onChange={(e) => setFormData({ ...formData, otherSocialNetworks: e.target.value })}
              placeholder="TikTok: @user, Instagram: @user"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Причина верификации</Label>
            <Select value={formData.reason} onValueChange={(value) => setFormData({ ...formData, reason: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Подтверждённые права собственности</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddPatent}>
                <Icon name="Plus" className="mr-2" size={16} />
                Добавить патент
              </Button>
            </div>
            {patents.map((patent) => (
              <div key={patent.id} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Input
                    value={patent.text}
                    onChange={(e) => handlePatentChange(patent.id, e.target.value)}
                    placeholder={`Пользователю ${formData.owner || '___'} принадлежит @${formData.username || '___'}`}
                  />
                </div>
                {patents.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePatent(patent.id)}
                  >
                    <Icon name="Trash2" size={18} />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Статус верификации *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.id} value={status.name}>{status.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statusNote">Примечание к статусу</Label>
              <Input
                id="statusNote"
                value={formData.statusNote}
                onChange={(e) => setFormData({ ...formData, statusNote: e.target.value })}
                placeholder="Дополнительная информация"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              <Icon name="Save" className="mr-2" size={18} />
              {editingUser ? 'Сохранить изменения' : 'Добавить пользователя'}
            </Button>
            {editingUser && (
              <Button type="button" variant="outline" onClick={onCancel}>
                <Icon name="X" className="mr-2" size={18} />
                Отменить
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserForm;
