import Link from 'next/link';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { KartuKeluargaTable } from '@/components/kartu-keluarga-table';

export default async function KartuKeluargaPage() {
  const kartuKeluarga = await db.kartuKeluarga.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold tracking-tight">
          Data Kartu Keluarga
        </h2>
        <div className="flex items-center space-x-2">
          <Button className="w-full sm:w-auto" asChild>
            <Link href="/dashboard/kartu-keluarga/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Tambah Kartu Keluarga</span>
              <span className="sm:hidden">Tambah KK</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Container for the table with horizontal scrolling on small screens */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <KartuKeluargaTable data={kartuKeluarga} />
        </div>
      </div>
    </div>
  );
}
