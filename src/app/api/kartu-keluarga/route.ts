import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { noKK, namaKepalaKeluarga, alamat, rt, rw, desa, kecamatan, kabupaten, kodePos, provinsi, anggotaKeluarga } =
      body

    // Check if KK already exists
    const existingKK = await db.kartuKeluarga.findUnique({
      where: {
        noKK,
      },
    })

    if (existingKK) {
      return new NextResponse("Nomor KK sudah terdaftar", { status: 400 })
    }

    // Create KK
    const kartuKeluarga = await db.kartuKeluarga.create({
      data: {
        noKK,
        namaKepalaKeluarga,
        alamat,
        rt,
        rw,
        desa,
        kecamatan,
        kabupaten,
        kodePos,
        provinsi,
      },
    })

    // Create anggota keluarga
    for (const anggota of anggotaKeluarga) {
      await db.anggotaKeluarga.create({
        data: {
          kartuKeluargaId: kartuKeluarga.id,
          nik: anggota.nik,
          namaLengkap: anggota.namaLengkap,
          jenisKelamin: anggota.jenisKelamin,
          tempatLahir: anggota.tempatLahir,
          tanggalLahir: anggota.tanggalLahir,
          agama: anggota.agama,
          pendidikan: anggota.pendidikan,
          jenisPekerjaan: anggota.jenisPekerjaan,
          statusPerkawinan: anggota.statusPerkawinan,
          statusHubungan: anggota.statusHubungan,
          kewarganegaraan: anggota.kewarganegaraan,
          noPaspor: anggota.noPaspor,
          noKitasKitap: anggota.noKitasKitap,
          namaAyah: anggota.namaAyah,
          namaIbu: anggota.namaIbu,
        },
      })
    }

    return NextResponse.json(kartuKeluarga)
  } catch (error) {
    console.error("[KARTU_KELUARGA_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
