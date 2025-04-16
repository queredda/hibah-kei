'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const kartuKeluargaSchema = z.object({
  noKK: z
    .string()
    .min(16, {
      message: 'Nomor KK harus 16 digit',
    })
    .max(16, {
      message: 'Nomor KK harus 16 digit',
    }),
  namaKepalaKeluarga: z.string().min(2, {
    message: 'Nama Kepala Keluarga wajib diisi',
  }),
  alamat: z.string().min(2, {
    message: 'Alamat wajib diisi',
  }),
  rt: z.string().min(1, {
    message: 'RT wajib diisi',
  }),
  rw: z.string().min(1, {
    message: 'RW wajib diisi',
  }),
  desa: z.string().min(2, {
    message: 'Desa/Kelurahan wajib diisi',
  }),
  kecamatan: z.string().min(2, {
    message: 'Kecamatan wajib diisi',
  }),
  kabupaten: z.string().min(2, {
    message: 'Kabupaten/Kota wajib diisi',
  }),
  kodePos: z.string().min(5, {
    message: 'Kode Pos wajib diisi',
  }),
  provinsi: z.string().min(2, {
    message: 'Provinsi wajib diisi',
  }),
  anggotaKeluarga: z
    .array(
      z.object({
        id: z.string().optional(),
        nik: z
          .string()
          .min(16, {
            message: 'NIK harus 16 digit',
          })
          .max(16, {
            message: 'NIK harus 16 digit',
          }),
        namaLengkap: z.string().min(2, {
          message: 'Nama Lengkap wajib diisi',
        }),
        jenisKelamin: z.string().min(1, {
          message: 'Jenis Kelamin wajib diisi',
        }),
        tempatLahir: z.string().min(2, {
          message: 'Tempat Lahir wajib diisi',
        }),
        tanggalLahir: z.date({
          required_error: 'Tanggal Lahir wajib diisi',
        }),
        agama: z.string().min(1, {
          message: 'Agama wajib diisi',
        }),
        pendidikan: z.string().min(1, {
          message: 'Pendidikan wajib diisi',
        }),
        jenisPekerjaan: z.string().min(1, {
          message: 'Jenis Pekerjaan wajib diisi',
        }),
        statusPerkawinan: z.string().min(1, {
          message: 'Status Perkawinan wajib diisi',
        }),
        statusHubungan: z.string().min(1, {
          message: 'Status Hubungan wajib diisi',
        }),
        kewarganegaraan: z.string().min(1, {
          message: 'Kewarganegaraan wajib diisi',
        }),
        noPaspor: z.string().optional(),
        noKitasKitap: z.string().optional(),
        namaAyah: z.string().min(2, {
          message: 'Nama Ayah wajib diisi',
        }),
        namaIbu: z.string().min(2, {
          message: 'Nama Ibu wajib diisi',
        }),
      })
    )
    .min(1, {
      message: 'Minimal harus ada 1 anggota keluarga',
    }),
});

type KartuKeluargaFormValues = z.infer<typeof kartuKeluargaSchema>;

// Define interfaces for the data structure
interface AnggotaKeluarga {
  id?: string;
  nik: string;
  namaLengkap: string;
  jenisKelamin: string;
  tempatLahir: string;
  tanggalLahir?: Date | null; // Allow null
  agama: string;
  pendidikan: string;
  jenisPekerjaan: string;
  statusPerkawinan: string;
  statusHubungan: string;
  kewarganegaraan: string;
  noPaspor?: string;
  noKitasKitap?: string;
  namaAyah: string;
  namaIbu: string;
  createdAt?: Date;
  updatedAt?: Date;
  kartuKeluargaId?: string; // Make this optional
}

interface KartuKeluargaData {
  id?: string;
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
  anggotaKeluarga?: AnggotaKeluarga[]; // This uses the updated AnggotaKeluarga interface
  createdAt?: Date; // Add these fields from the database
  updatedAt?: Date; // Add these fields from the database
}

// Update the component props to use the interface instead of 'any'
export function KartuKeluargaForm({
  kartuKeluarga,
}: {
  kartuKeluarga?: KartuKeluargaData;
} = {}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // Default values for the form
  const defaultValues: Partial<KartuKeluargaFormValues> = {
    noKK: kartuKeluarga?.noKK || '',
    namaKepalaKeluarga: kartuKeluarga?.namaKepalaKeluarga || '',
    alamat: kartuKeluarga?.alamat || '',
    rt: kartuKeluarga?.rt || '',
    rw: kartuKeluarga?.rw || '',
    desa: kartuKeluarga?.desa || '',
    kecamatan: kartuKeluarga?.kecamatan || '',
    kabupaten: kartuKeluarga?.kabupaten || '',
    kodePos: kartuKeluarga?.kodePos || '',
    provinsi: kartuKeluarga?.provinsi || '',
    anggotaKeluarga: kartuKeluarga?.anggotaKeluarga?.map(
      (anggota: AnggotaKeluarga) => ({
        id: anggota.id,
        nik: anggota.nik || '',
        namaLengkap: anggota.namaLengkap,
        jenisKelamin: anggota.jenisKelamin || '',
        tempatLahir: anggota.tempatLahir || '',
        // Fix: Always provide a Date object, never undefined
        tanggalLahir: anggota.tanggalLahir
          ? new Date(anggota.tanggalLahir)
          : new Date(),
        agama: anggota.agama || '',
        pendidikan: anggota.pendidikan || '',
        jenisPekerjaan: anggota.jenisPekerjaan || '',
        statusPerkawinan: anggota.statusPerkawinan || '',
        statusHubungan: anggota.statusHubungan || '',
        kewarganegaraan: anggota.kewarganegaraan || '',
        noPaspor: anggota.noPaspor || '',
        noKitasKitap: anggota.noKitasKitap || '',
        namaAyah: anggota.namaAyah || '',
        namaIbu: anggota.namaIbu || '',
      })
    ) || [
      {
        nik: '',
        namaLengkap: '',
        jenisKelamin: '',
        tempatLahir: '',
        // Fix: Provide a default Date for new entries
        tanggalLahir: new Date(),
        agama: '',
        pendidikan: '',
        jenisPekerjaan: '',
        statusPerkawinan: '',
        statusHubungan: '',
        kewarganegaraan: '',
        noPaspor: '',
        noKitasKitap: '',
        namaAyah: '',
        namaIbu: '',
      },
    ],
  };

  const form = useForm<KartuKeluargaFormValues>({
    resolver: zodResolver(kartuKeluargaSchema),
    defaultValues,
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    name: 'anggotaKeluarga',
    control: form.control,
  });

  // Fix for line 251:14 - Either use error or remove it
  async function onSubmit(data: KartuKeluargaFormValues) {
    setIsSubmitting(true);
    try {
      const url = kartuKeluarga?.id
        ? `/api/kartu-keluarga/${kartuKeluarga.id}`
        : '/api/kartu-keluarga';

      const method = kartuKeluarga?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      toast({
        title: 'Berhasil',
        description: kartuKeluarga?.id
          ? 'Data Kartu Keluarga berhasil diperbarui'
          : 'Data Kartu Keluarga berhasil ditambahkan',
      });

      router.push('/dashboard/kartu-keluarga');
      router.refresh();
    } catch (error: Error | unknown) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat menyimpan data',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Data Umum Kartu Keluarga</CardTitle>
            <CardDescription>
              Masukkan informasi umum Kartu Keluarga
            </CardDescription>x=
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="noKK"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Kartu Keluarga</FormLabel>
                    <FormControl>
                      <Input placeholder="Nomor KK" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="namaKepalaKeluarga"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Kepala Keluarga</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama Kepala Keluarga" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="alamat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat</FormLabel>
                  <FormControl>
                    <Input placeholder="Alamat" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="rt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RT</FormLabel>
                    <FormControl>
                      <Input placeholder="RT" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rw"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RW</FormLabel>
                    <FormControl>
                      <Input placeholder="RW" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="desa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desa/Kelurahan</FormLabel>
                    <FormControl>
                      <Input placeholder="Desa/Kelurahan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kecamatan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kecamatan</FormLabel>
                    <FormControl>
                      <Input placeholder="Kecamatan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="kabupaten"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kabupaten/Kota</FormLabel>
                    <FormControl>
                      <Input placeholder="Kabupaten/Kota" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kodePos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Pos</FormLabel>
                    <FormControl>
                      <Input placeholder="Kode Pos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="provinsi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provinsi</FormLabel>
                  <FormControl>
                    <Input placeholder="Provinsi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Anggota Keluarga</CardTitle>
            <CardDescription>
              Masukkan informasi anggota keluarga
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    Anggota Keluarga #{index + 1}
                  </h3>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus
                    </Button>
                  )}
                </div>
                <Separator />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`anggotaKeluarga.${index}.nik`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NIK</FormLabel>
                        <FormControl>
                          <Input placeholder="NIK" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`anggotaKeluarga.${index}.namaLengkap`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Lengkap</FormLabel>
                        <FormControl>
                          <Input placeholder="Nama Lengkap" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`anggotaKeluarga.${index}.jenisKelamin`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis Kelamin</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Jenis Kelamin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LAKI-LAKI">Laki-laki</SelectItem>
                            <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`anggotaKeluarga.${index}.tempatLahir`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tempat Lahir</FormLabel>
                        <FormControl>
                          <Input placeholder="Tempat Lahir" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`anggotaKeluarga.${index}.tanggalLahir`}
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Tanggal Lahir</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pilih tanggal</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date('1900-01-01')
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`anggotaKeluarga.${index}.agama`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agama</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Agama" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ISLAM">Islam</SelectItem>
                            <SelectItem value="KRISTEN">Kristen</SelectItem>
                            <SelectItem value="KATOLIK">Katolik</SelectItem>
                            <SelectItem value="HINDU">Hindu</SelectItem>
                            <SelectItem value="BUDDHA">Buddha</SelectItem>
                            <SelectItem value="KONGHUCU">Konghucu</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`anggotaKeluarga.${index}.pendidikan`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pendidikan</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Pendidikan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="TIDAK/BELUM SEKOLAH">
                              Tidak/Belum Sekolah
                            </SelectItem>
                            <SelectItem value="BELUM TAMAT SD/SEDERAJAT">
                              Belum Tamat SD/Sederajat
                            </SelectItem>
                            <SelectItem value="TAMAT SD/SEDERAJAT">
                              Tamat SD/Sederajat
                            </SelectItem>
                            <SelectItem value="SLTP/SEDERAJAT">
                              SLTP/Sederajat
                            </SelectItem>
                            <SelectItem value="SLTA/SEDERAJAT">
                              SLTA/Sederajat
                            </SelectItem>
                            <SelectItem value="DIPLOMA I/II">
                              Diploma I/II
                            </SelectItem>
                            <SelectItem value="AKADEMI/DIPLOMA III/S. MUDA">
                              Akademi/Diploma III/S. Muda
                            </SelectItem>
                            <SelectItem value="DIPLOMA IV/STRATA I">
                              Diploma IV/Strata I
                            </SelectItem>
                            <SelectItem value="STRATA II">Strata II</SelectItem>
                            <SelectItem value="STRATA III">
                              Strata III
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`anggotaKeluarga.${index}.jenisPekerjaan`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis Pekerjaan</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Jenis Pekerjaan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BELUM/TIDAK BEKERJA">
                              Belum/Tidak Bekerja
                            </SelectItem>
                            <SelectItem value="MENGURUS RUMAH TANGGA">
                              Mengurus Rumah Tangga
                            </SelectItem>
                            <SelectItem value="PELAJAR/MAHASISWA">
                              Pelajar/Mahasiswa
                            </SelectItem>
                            <SelectItem value="PENSIUNAN">Pensiunan</SelectItem>
                            <SelectItem value="PEGAWAI NEGERI SIPIL">
                              Pegawai Negeri Sipil
                            </SelectItem>
                            <SelectItem value="TENTARA NASIONAL INDONESIA">
                              Tentara Nasional Indonesia
                            </SelectItem>
                            <SelectItem value="KEPOLISIAN RI">
                              Kepolisian RI
                            </SelectItem>
                            <SelectItem value="PERDAGANGAN">
                              Perdagangan
                            </SelectItem>
                            <SelectItem value="PETANI/PEKEBUN">
                              Petani/Pekebun
                            </SelectItem>
                            <SelectItem value="PETERNAK">Peternak</SelectItem>
                            <SelectItem value="NELAYAN/PERIKANAN">
                              Nelayan/Perikanan
                            </SelectItem>
                            <SelectItem value="INDUSTRI">Industri</SelectItem>
                            <SelectItem value="KONSTRUKSI">
                              Konstruksi
                            </SelectItem>
                            <SelectItem value="TRANSPORTASI">
                              Transportasi
                            </SelectItem>
                            <SelectItem value="KARYAWAN SWASTA">
                              Karyawan Swasta
                            </SelectItem>
                            <SelectItem value="KARYAWAN BUMN">
                              Karyawan BUMN
                            </SelectItem>
                            <SelectItem value="KARYAWAN BUMD">
                              Karyawan BUMD
                            </SelectItem>
                            <SelectItem value="KARYAWAN HONORER">
                              Karyawan Honorer
                            </SelectItem>
                            <SelectItem value="BURUH HARIAN LEPAS">
                              Buruh Harian Lepas
                            </SelectItem>
                            <SelectItem value="BURUH TANI/PERKEBUNAN">
                              Buruh Tani/Perkebunan
                            </SelectItem>
                            <SelectItem value="BURUH NELAYAN/PERIKANAN">
                              Buruh Nelayan/Perikanan
                            </SelectItem>
                            <SelectItem value="BURUH PETERNAKAN">
                              Buruh Peternakan
                            </SelectItem>
                            <SelectItem value="PEMBANTU RUMAH TANGGA">
                              Pembantu Rumah Tangga
                            </SelectItem>
                            <SelectItem value="TUKANG CUKUR">
                              Tukang Cukur
                            </SelectItem>
                            <SelectItem value="TUKANG LISTRIK">
                              Tukang Listrik
                            </SelectItem>
                            <SelectItem value="TUKANG BATU">
                              Tukang Batu
                            </SelectItem>
                            <SelectItem value="TUKANG KAYU">
                              Tukang Kayu
                            </SelectItem>
                            <SelectItem value="TUKANG SOL SEPATU">
                              Tukang Sol Sepatu
                            </SelectItem>
                            <SelectItem value="TUKANG LAS/PANDAI BESI">
                              Tukang Las/Pandai Besi
                            </SelectItem>
                            <SelectItem value="TUKANG JAHIT">
                              Tukang Jahit
                            </SelectItem>
                            <SelectItem value="TUKANG GIGI">
                              Tukang Gigi
                            </SelectItem>
                            <SelectItem value="PENATA RIAS">
                              Penata Rias
                            </SelectItem>
                            <SelectItem value="PENATA BUSANA">
                              Penata Busana
                            </SelectItem>
                            <SelectItem value="PENATA RAMBUT">
                              Penata Rambut
                            </SelectItem>
                            <SelectItem value="MEKANIK">Mekanik</SelectItem>
                            <SelectItem value="SENIMAN">Seniman</SelectItem>
                            <SelectItem value="TABIB">Tabib</SelectItem>
                            <SelectItem value="PARAJI">Paraji</SelectItem>
                            <SelectItem value="PERANCANG BUSANA">
                              Perancang Busana
                            </SelectItem>
                            <SelectItem value="PENTERJEMAH">
                              Penterjemah
                            </SelectItem>
                            <SelectItem value="IMAM MASJID">
                              Imam Masjid
                            </SelectItem>
                            <SelectItem value="PENDETA">Pendeta</SelectItem>
                            <SelectItem value="PASTOR">Pastor</SelectItem>
                            <SelectItem value="WARTAWAN">Wartawan</SelectItem>
                            <SelectItem value="USTADZ/MUBALIGH">
                              Ustadz/Mubaligh
                            </SelectItem>
                            <SelectItem value="JURU MASAK">
                              Juru Masak
                            </SelectItem>
                            <SelectItem value="PROMOTOR ACARA">
                              Promotor Acara
                            </SelectItem>
                            <SelectItem value="ANGGOTA DPR-RI">
                              Anggota DPR-RI
                            </SelectItem>
                            <SelectItem value="ANGGOTA DPD">
                              Anggota DPD
                            </SelectItem>
                            <SelectItem value="ANGGOTA BPK">
                              Anggota BPK
                            </SelectItem>
                            <SelectItem value="PRESIDEN">Presiden</SelectItem>
                            <SelectItem value="WAKIL PRESIDEN">
                              Wakil Presiden
                            </SelectItem>
                            <SelectItem value="ANGGOTA MAHKAMAH KONSTITUSI">
                              Anggota Mahkamah Konstitusi
                            </SelectItem>
                            <SelectItem value="ANGGOTA KABINET/KEMENTERIAN">
                              Anggota Kabinet/Kementerian
                            </SelectItem>
                            <SelectItem value="DUTA BESAR">
                              Duta Besar
                            </SelectItem>
                            <SelectItem value="GUBERNUR">Gubernur</SelectItem>
                            <SelectItem value="WAKIL GUBERNUR">
                              Wakil Gubernur
                            </SelectItem>
                            <SelectItem value="BUPATI">Bupati</SelectItem>
                            <SelectItem value="WAKIL BUPATI">
                              Wakil Bupati
                            </SelectItem>
                            <SelectItem value="WALIKOTA">Walikota</SelectItem>
                            <SelectItem value="WAKIL WALIKOTA">
                              Wakil Walikota
                            </SelectItem>
                            <SelectItem value="ANGGOTA DPRD PROVINSI">
                              Anggota DPRD Provinsi
                            </SelectItem>
                            <SelectItem value="ANGGOTA DPRD KABUPATEN/KOTA">
                              Anggota DPRD Kabupaten/Kota
                            </SelectItem>
                            <SelectItem value="DOSEN">Dosen</SelectItem>
                            <SelectItem value="GURU">Guru</SelectItem>
                            <SelectItem value="PILOT">Pilot</SelectItem>
                            <SelectItem value="PENGACARA">Pengacara</SelectItem>
                            <SelectItem value="NOTARIS">Notaris</SelectItem>
                            <SelectItem value="ARSITEK">Arsitek</SelectItem>
                            <SelectItem value="AKUNTAN">Akuntan</SelectItem>
                            <SelectItem value="KONSULTAN">Konsultan</SelectItem>
                            <SelectItem value="DOKTER">Dokter</SelectItem>
                            <SelectItem value="BIDAN">Bidan</SelectItem>
                            <SelectItem value="PERAWAT">Perawat</SelectItem>
                            <SelectItem value="APOTEKER">Apoteker</SelectItem>
                            <SelectItem value="PSIKIATER/PSIKOLOG">
                              Psikiater/Psikolog
                            </SelectItem>
                            <SelectItem value="PENYIAR TELEVISI">
                              Penyiar Televisi
                            </SelectItem>
                            <SelectItem value="PENYIAR RADIO">
                              Penyiar Radio
                            </SelectItem>
                            <SelectItem value="PELAUT">Pelaut</SelectItem>
                            <SelectItem value="PENELITI">Peneliti</SelectItem>
                            <SelectItem value="SOPIR">Sopir</SelectItem>
                            <SelectItem value="PIALANG">Pialang</SelectItem>
                            <SelectItem value="PARANORMAL">
                              Paranormal
                            </SelectItem>
                            <SelectItem value="PEDAGANG">Pedagang</SelectItem>
                            <SelectItem value="PERANGKAT DESA">
                              Perangkat Desa
                            </SelectItem>
                            <SelectItem value="KEPALA DESA">
                              Kepala Desa
                            </SelectItem>
                            <SelectItem value="BIARAWATI">Biarawati</SelectItem>
                            <SelectItem value="WIRASWASTA">
                              Wiraswasta
                            </SelectItem>
                            <SelectItem value="LAINNYA">Lainnya</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`anggotaKeluarga.${index}.statusPerkawinan`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status Perkawinan</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Status Perkawinan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BELUM KAWIN">
                              Belum Kawin
                            </SelectItem>
                            <SelectItem value="KAWIN">Kawin</SelectItem>
                            <SelectItem value="CERAI HIDUP">
                              Cerai Hidup
                            </SelectItem>
                            <SelectItem value="CERAI MATI">
                              Cerai Mati
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`anggotaKeluarga.${index}.statusHubungan`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status Hubungan Dalam Keluarga</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Status Hubungan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="KEPALA KELUARGA">
                              Kepala Keluarga
                            </SelectItem>
                            <SelectItem value="SUAMI">Suami</SelectItem>
                            <SelectItem value="ISTRI">Istri</SelectItem>
                            <SelectItem value="ANAK">Anak</SelectItem>
                            <SelectItem value="MENANTU">Menantu</SelectItem>
                            <SelectItem value="CUCU">Cucu</SelectItem>
                            <SelectItem value="ORANG TUA">Orang Tua</SelectItem>
                            <SelectItem value="MERTUA">Mertua</SelectItem>
                            <SelectItem value="FAMILI LAIN">
                              Famili Lain
                            </SelectItem>
                            <SelectItem value="PEMBANTU">Pembantu</SelectItem>
                            <SelectItem value="LAINNYA">Lainnya</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`anggotaKeluarga.${index}.kewarganegaraan`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kewarganegaraan</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Kewarganegaraan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="WNI">WNI</SelectItem>
                            <SelectItem value="WNA">WNA</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`anggotaKeluarga.${index}.noPaspor`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>No. Paspor (Opsional)</FormLabel>
                        <FormControl>
                          <Input placeholder="No. Paspor" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`anggotaKeluarga.${index}.noKitasKitap`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>No. KITAS/KITAP (Opsional)</FormLabel>
                        <FormControl>
                          <Input placeholder="No. KITAS/KITAP" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`anggotaKeluarga.${index}.namaAyah`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Ayah</FormLabel>
                        <FormControl>
                          <Input placeholder="Nama Ayah" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`anggotaKeluarga.${index}.namaIbu`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Ibu</FormLabel>
                        <FormControl>
                          <Input placeholder="Nama Ibu" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  nik: '',
                  namaLengkap: '',
                  jenisKelamin: '',
                  tempatLahir: '',
                  tanggalLahir: new Date(),
                  agama: '',
                  pendidikan: '',
                  jenisPekerjaan: '',
                  statusPerkawinan: '',
                  statusHubungan: '',
                  kewarganegaraan: '',
                  noPaspor: '',
                  noKitasKitap: '',
                  namaAyah: '',
                  namaIbu: '',
                })
              }
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Anggota Keluarga
            </Button>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/kartu-keluarga')}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
