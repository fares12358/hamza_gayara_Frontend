import { useState } from 'react';
import { chequesApi } from '../../api/cheques';
import { Button } from './Button';
import { Dialog } from './Dialog';

export function ChequePhotoButton({ imageId }: { imageId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        صورة الشيك
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="صورة الشيك">
        <img src={chequesApi.imageUrl(imageId)} alt="صورة الشيك" className="max-h-[65dvh] w-full rounded-xl object-contain" />
        <Button className="mt-4 w-full" onClick={() => setOpen(false)}>
          إغلاق
        </Button>
      </Dialog>
    </>
  );
}
