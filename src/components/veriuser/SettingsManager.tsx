import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { Status, Category } from './types';

interface SettingsManagerProps {
  statuses: Status[];
  categories: Category[];
  onAddStatus: (name: string, color: string) => void;
  onDeleteStatus: (id: string) => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
}

const SettingsManager = ({
  statuses,
  categories,
  onAddStatus,
  onDeleteStatus,
  onAddCategory,
  onDeleteCategory,
}: SettingsManagerProps) => {
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#4CAF50');
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddStatus = () => {
    if (!newStatusName.trim()) return;
    onAddStatus(newStatusName, newStatusColor);
    setNewStatusName('');
    setNewStatusColor('#4CAF50');
    setShowStatusDialog(false);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    onAddCategory(newCategoryName);
    setNewCategoryName('');
    setShowCategoryDialog(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="Tag" size={24} />
                Управление статусами
              </CardTitle>
              <Button onClick={() => setShowStatusDialog(true)} size="sm">
                <Icon name="Plus" className="mr-2" size={18} />
                Добавить
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
                        onDeleteStatus(status.id);
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

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="FolderOpen" size={24} />
                Управление категориями
              </CardTitle>
              <Button onClick={() => setShowCategoryDialog(true)} size="sm">
                <Icon name="Plus" className="mr-2" size={18} />
                Добавить
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
                        onDeleteCategory(category.id);
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
      </div>

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
    </>
  );
};

export default SettingsManager;
