import type { User } from "@prisma/client"

export type SafeUser = Omit<User, "password" | "createdAt" | "updatedAt">

export type KartuKeluargaFormValues = {
  nomorKK: string
  namaKepalaKeluarga: string
  alamat: string
  rt: string
  rw: string
  desaKelurahan: string
  kecamatan: string
  kabupatenKota: string
  kodePos: string
  provinsi: string
  anggotaKeluarga: AnggotaKeluargaFormValues[]
}

export type AnggotaKeluargaFormValues = {
  id?: string
  nik: string
  namaLengkap: string
  jenisKelamin: string
  tempatLahir: string
  tanggalLahir: Date
  agama: string
  pendidikan: string
  jenisPekerjaan: string
  statusPerkawinan: string
  statusHubunganDalamKeluarga: string
  kewarganegaraan: string
  noPaspor?: string
  noKitasKitap?: string
  namaAyah: string
  namaIbu: string
}
