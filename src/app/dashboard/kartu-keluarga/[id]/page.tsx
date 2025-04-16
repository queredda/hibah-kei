'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ArrowLeft, Pencil, Printer } from 'lucide-react';

// Define the types for your data
type AnggotaKeluarga = {
  id: string;
  nik: string;
  namaLengkap: string;
  jenisKelamin: string;
  tempatLahir: string;
  tanggalLahir: string;
  agama: string;
  pendidikan: string;
  jenisPekerjaan: string;
  statusPerkawinan: string;
  statusHubungan: string;
  kewarganegaraan: string;
  noPaspor: string | null;
  noKitasKitap: string | null;
  namaAyah: string;
  namaIbu: string;
};

type KartuKeluarga = {
  id: string;
  noKK: string;
  namaKepalaKeluarga: string;
  alamat: string;
  rt: string;
  rw: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  kodePos: string;
  provinsi: string;
  anggotaKeluarga: AnggotaKeluarga[];
};

export default function KartuKeluargaDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [kartuKeluarga, setKartuKeluarga] = useState<KartuKeluarga | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/kartu-keluarga/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Kartu keluarga tidak ditemukan');
          } else {
            setError('Terjadi kesalahan saat mengambil data');
          }
          return;
        }

        const data = await response.json();
        setKartuKeluarga(data);
      } catch (err) {
        setError('Terjadi kesalahan saat mengambil data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-3 sm:p-6 md:p-8">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>

        {/* KK Data Card skeleton */}
        <Card className="shadow-sm">
          <CardHeader className="px-4 sm:px-6">
            <Skeleton className="h-6 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Skeleton className="h-4 w-36 mb-2" />
                <Skeleton className="h-6 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-36 mb-2" />
                <Skeleton className="h-6 w-full" />
              </div>
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-28 mb-2" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Family Members Card skeleton */}
        <Card className="shadow-sm">
          <CardHeader className="px-4 sm:px-6">
            <Skeleton className="h-6 w-52 mb-2" />
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent className="space-y-6 px-4 sm:px-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="space-y-4 rounded-lg border p-3 sm:p-4 bg-card/50"
              >
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
                  <Skeleton className="h-6 w-60" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Separator />
                <div className="grid grid-cols-1 gap-y-3 gap-x-4 xs:grid-cols-2">
                  {[...Array(10)].map((_, j) => (
                    <div key={j}>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !kartuKeluarga) {
    return (
      <div className="flex-1 p-4 sm:p-6 md:p-8 text-center">
        {error || 'Data tidak ditemukan'}
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-3 sm:p-6 md:p-8">
      {/* Header section with improved mobile layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Button variant="outline" size="sm" asChild className="w-fit">
            <Link href="/dashboard/kartu-keluarga">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            Detail Kartu Keluarga
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex-1 sm:flex-none"
          >
            <Link href="#" onClick={() => window.print()}>
              <Printer className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden xs:inline">Cetak</span>
            </Link>
          </Button>
          <Button size="sm" asChild className="flex-1 sm:flex-none">
            <Link href={`/dashboard/kartu-keluarga/${params.id}/edit`}>
              <Pencil className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden xs:inline">Edit</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Card for KK data with responsive padding */}
      <Card className="shadow-sm">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle>Data Umum Kartu Keluarga</CardTitle>
          <CardDescription>Informasi umum Kartu Keluarga</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Nomor Kartu Keluarga
              </h3>
              <p className="text-base font-medium break-words">
                {kartuKeluarga.noKK}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Nama Kepala Keluarga
              </h3>
              <p className="text-base font-medium break-words">
                {kartuKeluarga.namaKepalaKeluarga}
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Alamat
            </h3>
            <p className="text-base font-medium break-words">
              {kartuKeluarga.alamat}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">RT</h3>
              <p className="text-base font-medium">{kartuKeluarga.rt}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">RW</h3>
              <p className="text-base font-medium">{kartuKeluarga.rw}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Desa/Kelurahan
              </h3>
              <p className="text-base font-medium break-words">
                {kartuKeluarga.desa}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Kecamatan
              </h3>
              <p className="text-base font-medium break-words">
                {kartuKeluarga.kecamatan}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Kabupaten/Kota
              </h3>
              <p className="text-base font-medium break-words">
                {kartuKeluarga.kabupaten}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Kode Pos
              </h3>
              <p className="text-base font-medium">{kartuKeluarga.kodePos}</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Provinsi
            </h3>
            <p className="text-base font-medium break-words">
              {kartuKeluarga.provinsi}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Card for family members */}
      <Card className="shadow-sm">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle>Data Anggota Keluarga</CardTitle>
          <CardDescription>Informasi anggota keluarga</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-4 sm:px-6">
          {kartuKeluarga.anggotaKeluarga.map((anggota, index) => (
            <div
              key={anggota.id}
              className="space-y-4 rounded-lg border p-3 sm:p-4 bg-card/50"
            >
              {/* Member header with responsive layout */}
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
                <h3 className="text-base sm:text-lg font-medium line-clamp-1">
                  <span className="xs:hidden">#{index + 1}: </span>
                  <span className="hidden xs:inline">
                    Anggota #{index + 1}:
                  </span>{' '}
                  {anggota.namaLengkap}
                </h3>
                <div className="rounded-full bg-primary px-2 py-1 text-xs w-fit text-primary-foreground">
                  {anggota.statusHubungan}
                </div>
              </div>
              <Separator />

              {/* Member details with responsive grid */}
              <div className="grid grid-cols-1 gap-y-3 gap-x-4 xs:grid-cols-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                    NIK
                  </h3>
                  <p className="text-sm sm:text-base font-medium break-words">
                    {anggota.nik}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Jenis Kelamin
                  </h3>
                  <p className="text-sm sm:text-base font-medium">
                    {anggota.jenisKelamin}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-y-3 gap-x-4 xs:grid-cols-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Tempat Lahir
                  </h3>
                  <p className="text-sm sm:text-base font-medium break-words">
                    {anggota.tempatLahir}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Tanggal Lahir
                  </h3>
                  <p className="text-sm sm:text-base font-medium">
                    {format(new Date(anggota.tanggalLahir), 'dd MMMM yyyy')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-y-3 gap-x-4 xs:grid-cols-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Agama
                  </h3>
                  <p className="text-sm sm:text-base font-medium">
                    {anggota.agama}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Pendidikan
                  </h3>
                  <p className="text-sm sm:text-base font-medium">
                    {anggota.pendidikan}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-y-3 gap-x-4 xs:grid-cols-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Jenis Pekerjaan
                  </h3>
                  <p className="text-sm sm:text-base font-medium">
                    {anggota.jenisPekerjaan}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Status Perkawinan
                  </h3>
                  <p className="text-sm sm:text-base font-medium">
                    {anggota.statusPerkawinan}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-y-3 gap-x-4 xs:grid-cols-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Kewarganegaraan
                  </h3>
                  <p className="text-sm sm:text-base font-medium">
                    {anggota.kewarganegaraan}
                  </p>
                </div>
                {anggota.noPaspor && (
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                      No. Paspor
                    </h3>
                    <p className="text-sm sm:text-base font-medium break-words">
                      {anggota.noPaspor}
                    </p>
                  </div>
                )}
              </div>

              {anggota.noKitasKitap && (
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                    No. KITAS/KITAP
                  </h3>
                  <p className="text-sm sm:text-base font-medium break-words">
                    {anggota.noKitasKitap}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-y-3 gap-x-4 xs:grid-cols-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Nama Ayah
                  </h3>
                  <p className="text-sm sm:text-base font-medium break-words">
                    {anggota.namaAyah}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Nama Ibu
                  </h3>
                  <p className="text-sm sm:text-base font-medium break-words">
                    {anggota.namaIbu}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
