import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { User, Patent, Status, Category } from '@/components/veriuser/types';
import UserForm from '@/components/veriuser/UserForm';
import UserList from '@/components/veriuser/UserList';
import Certificate from '@/components/veriuser/Certificate';
import SettingsManager from '@/components/veriuser/SettingsManager';

const VeriUserApp = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([
    { id: '1', name: 'Верифицированный аккаунт', color: '#4CAF50' },
    { id: '2', name: 'Мошенник', color: '#F44336' },
  ]);
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Официальный канал' },
    { id: '2', name: 'Публичная личность' },
  ]);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [certificateUser, setCertificateUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUsers = localStorage.getItem('veriuser_users');
    const savedStatuses = localStorage.getItem('veriuser_statuses');
    const savedCategories = localStorage.getItem('veriuser_categories');

    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedStatuses) setStatuses(JSON.parse(savedStatuses));
    if (savedCategories) setCategories(JSON.parse(savedCategories));
  }, []);

  useEffect(() => {
    localStorage.setItem('veriuser_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('veriuser_statuses', JSON.stringify(statuses));
  }, [statuses]);

  useEffect(() => {
    localStorage.setItem('veriuser_categories', JSON.stringify(categories));
  }, [categories]);

  const generateUserId = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleFormSubmit = (formData: any, patents: Patent[]) => {
    if (!formData.owner || !formData.username || !formData.status) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля',
        variant: 'destructive',
      });
      return;
    }

    const userId = editingUser?.id || generateUserId();
    const newUser: User = {
      ...formData,
      id: userId,
      patents: patents.filter(p => p.text.trim()),
      createdAt: editingUser?.createdAt || new Date().toISOString(),
    };

    if (editingUser) {
      setUsers(users.map(u => (u.id === editingUser.id ? newUser : u)));
      toast({ title: 'Успешно', description: 'Пользователь обновлён' });
    } else {
      setUsers([...users, newUser]);
      toast({ title: 'Успешно', description: 'Пользователь добавлен' });
    }

    setEditingUser(null);
    setCertificateUser(newUser);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    toast({ title: 'Успешно', description: 'Пользователь удалён' });
  };

  const handleAddStatus = (name: string, color: string) => {
    const newStatus: Status = {
      id: Date.now().toString(),
      name,
      color,
    };
    setStatuses([...statuses, newStatus]);
    toast({ title: 'Успешно', description: 'Статус добавлен' });
  };

  const handleDeleteStatus = (id: string) => {
    setStatuses(statuses.filter(s => s.id !== id));
    toast({ title: 'Успешно', description: 'Статус удалён' });
  };

  const handleAddCategory = (name: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
    };
    setCategories([...categories, newCategory]);
    toast({ title: 'Успешно', description: 'Категория добавлена' });
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
    toast({ title: 'Успешно', description: 'Категория удалена' });
  };

  const getExpiryDate = (createdAt: string) => {
    const date = new Date(createdAt);
    date.setMonth(date.getMonth() + 1);
    return date.toLocaleDateString('ru-RU');
  };

  const getDaysLeft = (createdAt: string) => {
    const created = new Date(createdAt);
    const expiry = new Date(created);
    expiry.setMonth(expiry.getMonth() + 1);
    const today = new Date();
    const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  const getStatusColor = (statusName: string) => {
    const status = statuses.find(s => s.name === statusName);
    return status?.color || '#4CAF50';
  };

  const handleExportData = () => {
    const exportData = {
      users,
      statuses,
      categories,
      exportDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `veriuser_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({ title: 'Успешно', description: 'Данные экспортированы' });
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        
        if (importData.users) setUsers(importData.users);
        if (importData.statuses) setStatuses(importData.statuses);
        if (importData.categories) setCategories(importData.categories);

        toast({ title: 'Успешно', description: 'Данные импортированы' });
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Неверный формат файла',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl print:hidden">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">VeriUser.Telegram</h1>
          </div>
          <p className="text-gray-600">Система верификации пользователей Telegram</p>
          
          <div className="flex justify-center gap-3 mt-4">
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Icon name="Download" className="mr-2" size={16} />
              Экспорт данных
            </Button>
            <Button variant="outline" size="sm" asChild>
              <label htmlFor="import-file" className="cursor-pointer">
                <Icon name="Upload" className="mr-2" size={16} />
                Импорт данных
                <input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </Button>
          </div>
        </header>

        <Tabs defaultValue="add" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="add">
              <Icon name="UserPlus" className="mr-2" size={18} />
              Добавить
            </TabsTrigger>
            <TabsTrigger value="list">
              <Icon name="Users" className="mr-2" size={18} />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Icon name="Settings" className="mr-2" size={18} />
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="animate-fade-in">
            <UserForm
              editingUser={editingUser}
              statuses={statuses}
              categories={categories}
              onSubmit={handleFormSubmit}
              onCancel={() => setEditingUser(null)}
            />
          </TabsContent>

          <TabsContent value="list" className="animate-fade-in">
            <UserList
              users={users}
              statuses={statuses}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewCertificate={setCertificateUser}
              getStatusColor={getStatusColor}
              getDaysLeft={getDaysLeft}
            />
          </TabsContent>

          <TabsContent value="settings" className="animate-fade-in">
            <SettingsManager
              statuses={statuses}
              categories={categories}
              onAddStatus={handleAddStatus}
              onDeleteStatus={handleDeleteStatus}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          </TabsContent>
        </Tabs>
      </div>

      <Certificate
        user={certificateUser}
        onClose={() => setCertificateUser(null)}
        getStatusColor={getStatusColor}
        getExpiryDate={getExpiryDate}
        getDaysLeft={getDaysLeft}
        onToast={toast}
      />

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .certificate-container,
          .certificate-container * {
            visibility: visible;
          }
          .certificate-container {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default VeriUserApp;