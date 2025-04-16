import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { KartuKeluargaForm } from '@/components/kartu-keluarga-form';

export default async function EditKartuKeluargaPage({
  params,
}: {
  params: { id: string };
}) {
  const dbData = await db.kartuKeluarga.findUnique({
    where: {
      id: params.id,
    },
    include: {
      anggotaKeluarga: true,
    },
  });

  if (!dbData) {
    notFound();
  }

  const kartuKeluarga = {
    id: dbData.id,
    noKK: dbData.noKK,
    namaKepalaKeluarga: dbData.namaKepalaKeluarga,
    alamat: dbData.alamat,
    rt: dbData.rt,
    rw: dbData.rw,
    desa: dbData.desa,
    kecamatan: dbData.kecamatan,
    kabupaten: dbData.kabupaten,
    kodePos: dbData.kodePos,
    provinsi: dbData.provinsi,
    // Transform anggota keluarga to handle null values correctly
    anggotaKeluarga: dbData.anggotaKeluarga.map((member) => ({
      id: member.id,
      nik: member.nik || '',
      namaLengkap: member.namaLengkap,
      jenisKelamin: member.jenisKelamin || '',
      tempatLahir: member.tempatLahir || '',
      tanggalLahir: member.tanggalLahir,
      agama: member.agama || '',
      pendidikan: member.pendidikan || '',
      jenisPekerjaan: member.jenisPekerjaan || '',
      statusPerkawinan: member.statusPerkawinan || '',
      statusHubungan: member.statusHubungan || '',
      kewarganegaraan: member.kewarganegaraan || '',
      noPaspor: member.noPaspor || undefined, 
      noKitasKitap: member.noKitasKitap || undefined,
      namaAyah: member.namaAyah || '',
      namaIbu: member.namaIbu || '',
    })),
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Edit Kartu Keluarga
        </h2>
      </div>
      <KartuKeluargaForm kartuKeluarga={kartuKeluarga} />
    </div>
  );
}
