import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { User } from './types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CertificateProps {
  user: User | null;
  onClose: () => void;
  getStatusColor: (statusName: string) => string;
  getExpiryDate: (createdAt: string) => string;
  getDaysLeft: (createdAt: string) => number;
  onToast: (config: { title: string; description: string; variant?: 'destructive' }) => void;
}

const Certificate = ({ user, onClose, getStatusColor, getExpiryDate, getDaysLeft, onToast }: CertificateProps) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current || !user) return;

    try {
      const element = certificateRef.current;
      
      // Клонируем элемент для генерации PDF без изменения оригинала
      const clonedElement = element.cloneNode(true) as HTMLElement;
      clonedElement.style.position = 'absolute';
      clonedElement.style.left = '-9999px';
      document.body.appendChild(clonedElement);

      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        backgroundColor: '#f8fafc',
        logging: false,
        useCORS: true,
      });

      // Удаляем клонированный элемент
      document.body.removeChild(clonedElement);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`certificate_${user.username}_${user.id}.pdf`);

      onToast({
        title: 'Успешно',
        description: 'Сертификат скачан в PDF',
      });
    } catch (error) {
      onToast({
        title: 'Ошибка',
        description: 'Не удалось создать PDF',
        variant: 'destructive',
      });
    }
  };

  if (!user) return null;

  const daysLeft = getDaysLeft(user.createdAt);

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Сертификат верификации</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div ref={certificateRef} className="certificate-container bg-gray-50 p-6 rounded-xl">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-xl">V</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">VeriUserRU</h2>
                    <p className="text-blue-100 text-xs">Сертификат верификации</p>
                  </div>
                </div>
                <Badge
                  className="px-3 py-1.5 text-sm font-medium flex items-center gap-1.5"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    color: 'white',
                  }}
                >
                  <Icon name="AlertCircle" size={14} />
                  {user.status}
                </Badge>
              </div>
            </div>

            <div className="bg-white px-8 py-6">
              <div className="text-center mb-6 pb-6 border-b">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.owner}</h1>
                <p className="text-xl text-blue-600">@{user.username}</p>
              </div>



              <div 
                className="rounded-xl p-4 mb-6 text-center"
                style={{
                  backgroundColor: daysLeft > 7 ? '#E8F5E9' : '#FFF3E0',
                }}
              >
                <p className="text-xs text-gray-600 mb-1">СРОК ДЕЙСТВИЯ</p>
                <p 
                  className="text-base font-semibold"
                  style={{
                    color: daysLeft > 7 ? '#2E7D32' : '#EF6C00',
                  }}
                >Действителен 30 дней</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border rounded-lg p-3 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-1">КАНАЛ / ПРОФИЛЬ</p>
                  <p className="text-sm font-medium text-gray-900">{user.channelOrProfile || 'Не указано'}</p>
                </div>
                <div className="border rounded-lg p-3 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-1">ВОЗРАСТ</p>
                  <p className="text-sm font-medium text-gray-900">{user.age || 'Не указано'}</p>
                </div>
              </div>

              {user.otherSocialNetworks && (
                <div className="border rounded-lg p-3 bg-gray-50 mb-6">
                  <p className="text-xs text-gray-500 mb-1">ДРУГИЕ СОЦИАЛЬНЫЕ СЕТИ</p>
                  <p className="text-sm text-gray-900">{user.otherSocialNetworks}</p>
                </div>
              )}

              {user.patents.length > 0 && (
                <div className="border rounded-lg p-4 bg-blue-50 mb-6">
                  <p className="text-xs text-gray-700 mb-3 flex items-center gap-2">
                    <Icon name="Lock" size={14} />
                    Подтверждённые права собственности
                  </p>
                  <div className="space-y-2">
                    {user.patents.map((patent, index) => (
                      <div key={patent.id} className="flex items-start gap-2 text-sm text-gray-800">
                        <span className="text-blue-600 font-medium">#{index + 1}</span>
                        <span>{patent.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-600 rounded-b-2xl p-5 text-white text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Icon name="CheckCircle" size={18} />
                <span className="font-semibold text-sm">Подтверждено командой VeriUserRU</span>
              </div>
              <div className="flex justify-center gap-8 text-xs">
                <div className="bg-white/20 rounded-lg px-4 py-2">
                  <p className="text-blue-100 mb-0.5">Дата выдачи</p>
                  <p className="font-semibold">{new Date(user.createdAt).toLocaleDateString('ru-RU')}</p>
                </div>
                <div className="bg-white/20 rounded-lg px-4 py-2">
                  <p className="text-blue-100 mb-0.5">Действителен до</p>
                  <p className="font-semibold">{getExpiryDate(user.createdAt)}</p>
                </div>
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
  );
};

export default Certificate;