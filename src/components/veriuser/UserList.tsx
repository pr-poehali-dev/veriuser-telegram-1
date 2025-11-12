import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { User, Status } from './types';

interface UserListProps {
  users: User[];
  statuses: Status[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onViewCertificate: (user: User) => void;
  getStatusColor: (statusName: string) => string;
  getDaysLeft: (createdAt: string) => number;
}

const UserList = ({ users, statuses, onEdit, onDelete, onViewCertificate, getStatusColor, getDaysLeft }: UserListProps) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchId, setSearchId] = useState('');

  const filteredUsers = users.filter(user => {
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesSearch = !searchId || user.id.includes(searchId);
    return matchesStatus && matchesSearch;
  });

  return (
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
                          onClick={() => onViewCertificate(user)}
                          className="flex-1 lg:flex-none"
                        >
                          <Icon name="FileText" className="mr-2" size={16} />
                          Сертификат
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(user)}
                          className="flex-1 lg:flex-none"
                        >
                          <Icon name="Edit" className="mr-2" size={16} />
                          Изменить
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onDelete(user.id)}
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
  );
};

export default UserList;
