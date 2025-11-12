import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Patent {
  id: string;
  text: string;
}

interface User {
  id: string;
  owner: string;
  username: string;
  channelOrProfile: string;
  age: string;
  reason: string;
  patents: Patent[];
  status: string;
  statusNote: string;
  otherSocialNetworks: string;
  createdAt: string;
}

interface Status {
  id: string;
  name: string;
  color: string;
}

interface Category {
  id: string;
  name: string;
}

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
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [certificateUser, setCertificateUser] = useState<User | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchId, setSearchId] = useState('');
  
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#4CAF50');
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const certificateRef = useRef<HTMLDivElement>(null);

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
      setUsers(users.map(u => u.id === editingUser.id ? newUser : u));
      toast({ title: 'Успешно', description: 'Пользователь обновлён' });
    } else {
      setUsers([...users, newUser]);
      toast({ title: 'Успешно', description: 'Пользователь добавлен' });
    }

    resetForm();
    setCertificateUser(newUser);
  };

  const resetForm = () => {
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
    setEditingUser(null);
  };

  const handleEdit = (user: User) => {
    setFormData({
      owner: user.owner,
      username: user.username,
      channelOrProfile: user.channelOrProfile,
      age: user.age,
      reason: user.reason,
      status: user.status,
      statusNote: user.statusNote,
      otherSocialNetworks: user.otherSocialNetworks,
    });
    setPatents(user.patents.length > 0 ? user.patents : [{ id: '1', text: '' }]);
    setEditingUser(user);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    toast({ title: 'Успешно', description: 'Пользователь удалён' });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current || !certificateUser) return;

    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: null,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`certificate_${certificateUser.username}_${certificateUser.id}.pdf`);

      toast({
        title: 'Успешно',
        description: 'Сертификат скачан в PDF',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать PDF',
        variant: 'destructive',
      });
    }
  };

  const handleAddStatus = () => {
    if (!newStatusName.trim()) return;
    
    const newStatus: Status = {
      id: Date.now().toString(),
      name: newStatusName,
      color: newStatusColor,
    };
    
    setStatuses([...statuses, newStatus]);
    setNewStatusName('');
    setNewStatusColor('#4CAF50');
    setShowStatusDialog(false);
    toast({ title: 'Успешно', description: 'Статус добавлен' });
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCategoryName,
    };
    
    setCategories([...categories, newCategory]);
    setNewCategoryName('');
    setShowCategoryDialog(false);
    toast({ title: 'Успешно', description: 'Категория добавлена' });
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

  const filteredUsers = users.filter(user => {
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesSearch = !searchId || user.id.includes(searchId);
    return matchesStatus && matchesSearch;
  });

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
        </header>

        <Tabs defaultValue="add" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="add">
              <Icon name="UserPlus" className="mr-2" size={18} />
              Добавить
            </TabsTrigger>
            <TabsTrigger value="list">
              <Icon name="Users" className="mr-2" size={18} />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="statuses">
              <Icon name="Tag" className="mr-2" size={18} />
              Статусы
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Icon name="FolderOpen" className="mr-2" size={18} />
              Категории
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="animate-fade-in">
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
                    {patents.map((patent, index) => (
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
                      <Button type="button" variant="outline" onClick={resetForm}>
                        <Icon name="X" className="mr-2" size={18} />
                        Отменить
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="animate-fade-in">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Users" size={24} />
                  Список верифицированных пользователей
                </CardTitle>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Поиск по ID..."
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      {statuses.map((status) => (
                        <SelectItem key={status.id} value={status.name}>{status.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Icon name="Users" size={48} className="mx-auto mb-4 opacity-20" />
                      <p>Нет пользователей</p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => {
                      const daysLeft = getDaysLeft(user.createdAt);
                      return (
                        <Card key={user.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row gap-4 justify-between">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="text-xl font-semibold text-gray-900">{user.owner}</h3>
                                    <p className="text-blue-600">@{user.username}</p>
                                  </div>
                                  <Badge
                                    className="ml-2"
                                    style={{
                                      backgroundColor: getStatusColor(user.status),
                                      color: 'white',
                                    }}
                                  >
                                    {user.status}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                  <div><span className="text-gray-500">ID:</span> <span className="font-mono">{user.id}</span></div>
                                  {user.age && <div><span className="text-gray-500">Возраст:</span> {user.age}</div>}
                                  {user.channelOrProfile && <div className="sm:col-span-2"><span className="text-gray-500">Канал:</span> {user.channelOrProfile}</div>}
                                  {user.otherSocialNetworks && (
                                    <div className="sm:col-span-2"><span className="text-gray-500">Другие соцсети:</span> {user.otherSocialNetworks}</div>
                                  )}
                                </div>

                                <div className={`text-sm font-medium ${daysLeft > 7 ? 'text-green-600' : 'text-orange-600'}`}>
                                  {daysLeft > 0 ? `Действителен ещё ${daysLeft} дней` : 'Требуется доп. проверка'}
                                </div>
                              </div>

                              <div className="flex lg:flex-col gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setCertificateUser(user)}
                                  className="flex-1 lg:flex-none"
                                >
                                  <Icon name="FileText" className="mr-2" size={16} />
                                  Сертификат
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(user)}
                                  className="flex-1 lg:flex-none"
                                >
                                  <Icon name="Edit" className="mr-2" size={16} />
                                  Изменить
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDelete(user.id)}
                                  className="flex-1 lg:flex-none"
                                >
                                  <Icon name="Trash2" className="mr-2" size={16} />
                                  Удалить
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statuses" className="animate-fade-in">
            <Card className="max-w-3xl mx-auto shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Tag" size={24} />
                    Управление статусами
                  </CardTitle>
                  <Button onClick={() => setShowStatusDialog(true)}>
                    <Icon name="Plus" className="mr-2" size={18} />
                    Добавить статус
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statuses.map((status) => (
                    <div key={status.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                        <span className="font-medium">{status.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (statuses.length > 1) {
                            setStatuses(statuses.filter(s => s.id !== status.id));
                            toast({ title: 'Успешно', description: 'Статус удалён' });
                          }
                        }}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="animate-fade-in">
            <Card className="max-w-3xl mx-auto shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="FolderOpen" size={24} />
                    Управление категориями
                  </CardTitle>
                  <Button onClick={() => setShowCategoryDialog(true)}>
                    <Icon name="Plus" className="mr-2" size={18} />
                    Добавить категорию
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <span className="font-medium">{category.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (categories.length > 1) {
                            setCategories(categories.filter(c => c.id !== category.id));
                            toast({ title: 'Успешно', description: 'Категория удалена' });
                          }
                        }}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {certificateUser && (
        <Dialog open={!!certificateUser} onOpenChange={() => setCertificateUser(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Сертификат верификации</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div ref={certificateRef} className="certificate-container">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-2xl">V</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">VeriUserRU</h2>
                        <p className="text-blue-100 text-sm">Сертификат верификации</p>
                      </div>
                    </div>
                    <Badge
                      className="px-4 py-2 text-white font-medium"
                      style={{
                        backgroundColor: getStatusColor(certificateUser.status),
                      }}
                    >
                      {certificateUser.status}
                    </Badge>
                  </div>

                  <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">{certificateUser.owner}</h1>
                    <p className="text-2xl text-blue-100">@{certificateUser.username}</p>
                  </div>

                  <div 
                    className="rounded-xl p-6 mb-6 text-center"
                    style={{
                      backgroundColor: getStatusColor(certificateUser.status),
                    }}
                  >
                    <p className="text-lg font-semibold text-white">
                      Действителен ещё {getDaysLeft(certificateUser.createdAt)} дней
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-xs text-blue-100 mb-1">КАНАЛ / ПРОФИЛЬ</p>
                      <p className="font-semibold">{certificateUser.channelOrProfile || 'Не указано'}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-xs text-blue-100 mb-1">ВОЗРАСТ</p>
                      <p className="font-semibold">{certificateUser.age || 'Не указано'}</p>
                    </div>
                  </div>

                  {certificateUser.otherSocialNetworks && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
                      <p className="text-xs text-blue-100 mb-2">ДРУГИЕ СОЦИАЛЬНЫЕ СЕТИ</p>
                      <p className="text-sm">{certificateUser.otherSocialNetworks}</p>
                    </div>
                  )}

                  {certificateUser.patents.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
                      <p className="text-xs text-blue-100 mb-3">
                        <Icon name="Shield" className="inline mr-2" size={14} />
                        Подтверждённые права собственности
                      </p>
                      <div className="space-y-2">
                        {certificateUser.patents.map((patent, index) => (
                          <div key={patent.id} className="flex items-start gap-2 text-sm">
                            <span className="text-blue-200">#{index + 1}</span>
                            <span>{patent.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-600/50 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Icon name="CheckCircle" size={20} />
                      <span className="font-semibold">Подтверждено командой: VeriUserRU</span>
                    </div>
                    <div className="flex justify-center gap-8 text-sm">
                      <div>
                        <p className="text-blue-100">Дата выдачи</p>
                        <p className="font-semibold">{new Date(certificateUser.createdAt).toLocaleDateString('ru-RU')}</p>
                      </div>
                      <div>
                        <p className="text-blue-100">Действителен до</p>
                        <p className="font-semibold">{getExpiryDate(certificateUser.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 text-center text-xs text-blue-100">
                    ID сертификата: {certificateUser.id}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleDownloadPDF} className="flex-1">
                  <Icon name="Download" className="mr-2" size={18} />
                  Скачать PDF
                </Button>
                <Button onClick={handlePrint} variant="outline" className="flex-1">
                  <Icon name="Printer" className="mr-2" size={18} />
                  Печать
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить статус</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="statusName">Название статуса</Label>
              <Input
                id="statusName"
                value={newStatusName}
                onChange={(e) => setNewStatusName(e.target.value)}
                placeholder="Название"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="statusColor">Цвет</Label>
              <div className="flex gap-2">
                <Input
                  id="statusColor"
                  type="color"
                  value={newStatusColor}
                  onChange={(e) => setNewStatusColor(e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  value={newStatusColor}
                  onChange={(e) => setNewStatusColor(e.target.value)}
                  placeholder="#4CAF50"
                />
              </div>
            </div>
            <Button onClick={handleAddStatus} className="w-full">
              Добавить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить категорию</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Название категории</Label>
              <Input
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Название"
              />
            </div>
            <Button onClick={handleAddCategory} className="w-full">
              Добавить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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