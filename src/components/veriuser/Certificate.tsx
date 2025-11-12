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
  onToast: (config: { title: string; description: string; variant?: 'destructive' }) => void;
}

const Certificate = ({ user, onClose, getStatusColor, getExpiryDate, onToast }: CertificateProps) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current || !user) return;

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

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
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
                    backgroundColor: getStatusColor(user.status),
                  }}
                >
                  {user.status}
                </Badge>
              </div>

              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2">{user.owner}</h1>
                <p className="text-2xl text-blue-100">@{user.username}</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-xs text-blue-100 mb-1">КАНАЛ / ПРОФИЛЬ</p>
                  <p className="font-semibold">{user.channelOrProfile || 'Не указано'}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-xs text-blue-100 mb-1">ВОЗРАСТ</p>
                  <p className="font-semibold">{user.age || 'Не указано'}</p>
                </div>
              </div>

              {user.otherSocialNetworks && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
                  <p className="text-xs text-blue-100 mb-2">ДРУГИЕ СОЦИАЛЬНЫЕ СЕТИ</p>
                  <p className="text-sm">{user.otherSocialNetworks}</p>
                </div>
              )}

              {user.patents.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
                  <p className="text-xs text-blue-100 mb-3">
                    <Icon name="Shield" className="inline mr-2" size={14} />
                    Подтверждённые права собственности
                  </p>
                  <div className="space-y-2">
                    {user.patents.map((patent, index) => (
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
                    <p className="font-semibold">{new Date(user.createdAt).toLocaleDateString('ru-RU')}</p>
                  </div>
                  <div>
                    <p className="text-blue-100">Действителен до</p>
                    <p className="font-semibold">{getExpiryDate(user.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center text-xs text-blue-100">
                ID сертификата: {user.id}
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
