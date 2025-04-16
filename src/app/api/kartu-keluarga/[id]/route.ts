import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// First, define an interface for AnggotaKeluarga if it's not already defined elsewhere
interface AnggotaKeluarga {
  id: string;
  nik?: string | null;
  namaLengkap: string;
  jenisKelamin?: string | null;
  tempatLahir?: string | null;
  tanggalLahir?: Date | null;
  agama?: string | null;
  pendidikan?: string | null;
  jenisPekerjaan?: string | null;
  statusPerkawinan?: string | null;
  statusHubungan?: string | null;
  kewarganegaraan?: string | null;
  noPaspor?: string | null;
  noKitasKitap?: string | null;
  namaAyah?: string | null;
  namaIbu?: string | null;
  kartuKeluargaId: string;
  kartuKeluarga?: { noKK: string } | null;
}

// Add this interface for Prisma errors at the top of your file

interface PrismaError extends Error {
  code?: string;
  meta?: {
    target?: string[];
    [key: string]: unknown;
  };
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const kartuKeluarga = await db.kartuKeluarga.findUnique({
      where: {
        id: params.id,
      },
      include: {
        anggotaKeluarga: true,
      },
    });

    if (!kartuKeluarga) {
      return new NextResponse(null, { status: 404 });
    }

    return NextResponse.json(kartuKeluarga);
  } catch (error) {
    console.error('Error fetching kartu keluarga:', error);
    return new NextResponse(null, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!params.id) {
      return new NextResponse('ID is required', { status: 400 });
    }

    const body = await req.json();
    const {
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
      anggotaKeluarga,
    } = body;

    // Check if KK exists
    const existingKK = await db.kartuKeluarga.findUnique({
      where: {
        id: params.id,
      },
      include: {
        anggotaKeluarga: true,
      },
    });

    if (!existingKK) {
      return NextResponse.json(
        { error: 'Kartu Keluarga tidak ditemukan' },
        { status: 404 }
      );
    }

    // Step 1: Update the KartuKeluarga data
    const kartuKeluarga = await db.kartuKeluarga.update({
      where: {
        id: params.id,
      },
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
    });

    // Step 2: Track IDs of existing members
    const existingIds = new Set(
      existingKK.anggotaKeluarga.map((member: AnggotaKeluarga) => member.id)
    );

    // Step 3: Track which members we've processed
    const updatedIds = new Set();
    const errors = [];

    // Create a map of existing NIKs in this family card to prevent false duplicates
    const existingNIKsInThisCard = new Map();
    existingKK.anggotaKeluarga.forEach((member: AnggotaKeluarga) => {
      if (member.nik) {
        existingNIKsInThisCard.set(member.nik, member.id);
      }
    });

    // Track NIKs used in this update batch to prevent duplicate NIKs in the same submission
    const usedNIKsInThisBatch = new Map();

    // Step 4: Process each family member sequentially - only process valid members
    const validAnggota = Array.isArray(anggotaKeluarga)
      ? anggotaKeluarga.filter((a) => a && a.namaLengkap)
      : [];

    // First, create a map of NIKs to existing member IDs for quick lookup
    const nikToExistingId = new Map();
    existingKK.anggotaKeluarga.forEach((member: AnggotaKeluarga) => {
      if (member.nik) {
        nikToExistingId.set(member.nik, member.id);
      }
    });

    for (const anggota of validAnggota) {
      try {
        // If this NIK matches an existing member but no ID was provided,
        // we should add the existing ID to maintain the association
        if (anggota.nik && !anggota.id && nikToExistingId.has(anggota.nik)) {
          anggota.id = nikToExistingId.get(anggota.nik);
        }

        // Check for NIK being used by another member in this batch
        if (
          anggota.nik &&
          usedNIKsInThisBatch.has(anggota.nik) &&
          usedNIKsInThisBatch.get(anggota.nik) !== anggota.id
        ) {
          errors.push(
            `NIK ${anggota.nik} digunakan lebih dari sekali dalam data yang Anda kirimkan.`
          );
          continue;
        }

        // Check for NIK being used in other records
        if (anggota.nik) {
          // Check if this member's NIK is already used in the usedNIKsInThisBatch
          if (
            usedNIKsInThisBatch.has(anggota.nik) &&
            usedNIKsInThisBatch.get(anggota.nik) !== anggota.id
          ) {
            errors.push(
              `NIK ${anggota.nik} digunakan lebih dari sekali dalam data yang dikirim.`
            );
            continue;
          }

          // Check if this is an existing member keeping their own NIK
          const isKeepingOwnNik =
            anggota.id &&
            existingNIKsInThisCard.has(anggota.nik) &&
            existingNIKsInThisCard.get(anggota.nik) === anggota.id;

          if (!isKeepingOwnNik) {
            // Check if any other member is using this NIK (excluding this member if it has an ID)
            const nikExists = await db.anggotaKeluarga.findFirst({
              where: {
                nik: anggota.nik,
                // Exclude this member if it has an ID
                ...(anggota.id ? { id: { not: anggota.id } } : {}),
              },
              include: {
                kartuKeluarga: {
                  select: {
                    noKK: true,
                  },
                },
              },
            });

            if (nikExists) {
              if (nikExists.kartuKeluargaId === params.id) {
                errors.push(
                  `NIK ${anggota.nik} sudah digunakan oleh anggota lain dalam kartu keluarga ini.`
                );
              } else {
                errors.push(
                  `NIK ${
                    anggota.nik
                  } sudah digunakan pada kartu keluarga dengan nomor ${
                    nikExists.kartuKeluarga?.noKK || 'lain'
                  }.`
                );
              }
              continue;
            }
          }

          // Record this NIK as used in this batch
          usedNIKsInThisBatch.set(
            anggota.nik,
            anggota.id || `new-${anggota.nik}`
          );
        }

        const memberData = {
          kartuKeluargaId: kartuKeluarga.id,
          nik: anggota.nik || null,
          namaLengkap: anggota.namaLengkap || '',
          jenisKelamin: anggota.jenisKelamin || null,
          tempatLahir: anggota.tempatLahir || null,
          tanggalLahir: anggota.tanggalLahir || null,
          agama: anggota.agama || null,
          pendidikan: anggota.pendidikan || null,
          jenisPekerjaan: anggota.jenisPekerjaan || null,
          statusPerkawinan: anggota.statusPerkawinan || null,
          statusHubungan: anggota.statusHubungan || null,
          kewarganegaraan: anggota.kewarganegaraan || null,
          noPaspor: anggota.noPaspor || null,
          noKitasKitap: anggota.noKitasKitap || null,
          namaAyah: anggota.namaAyah || null,
          namaIbu: anggota.namaIbu || null,
        };

        // If member has an ID and exists, update it
        if (anggota.id && existingIds.has(anggota.id)) {
          await db.anggotaKeluarga.update({
            where: { id: anggota.id },
            data: memberData,
          });
          updatedIds.add(anggota.id);
        } else {
          // Create new member
          const newMember = await db.anggotaKeluarga.create({
            data: memberData,
          });
          updatedIds.add(newMember.id);
        }
      } catch (error: unknown) {
        // Handle specific Prisma errors
        if (
          error instanceof Error &&
          (error as PrismaError).code === 'P2002' &&
          (error as PrismaError).meta?.target?.includes('nik')
        ) {
          errors.push(
            `NIK ${anggota.nik} sudah terdaftar dalam database. Silakan gunakan NIK yang berbeda.`
          );
        } else {
          console.error(`Error processing family member:`, error);
          errors.push(
            `Gagal memproses anggota keluarga: ${
              anggota.namaLengkap || 'Tidak bernama'
            } - ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }
    }

    // Step 5: Delete any members that weren't included in the update
    try {
      // Get IDs to delete - these are members in the existing data but not in the updated data
      const idsToDelete = Array.from(existingIds).filter(
        (id) => !updatedIds.has(id)
      );

      if (idsToDelete.length > 0) {
        await db.anggotaKeluarga.deleteMany({
          where: {
            id: { in: idsToDelete },
          },
        });
      }
    } catch (error: Error | unknown) {
      console.error('Error deleting removed members:', error);
      // Continue despite deletion error - we can still return the updated data
    }

    // If we have validation errors, return them
    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join('\n') }, { status: 400 });
    }

    // Step 6: Fetch and return the updated data
    const updatedKK = await db.kartuKeluarga.findUnique({
      where: {
        id: params.id,
      },
      include: {
        anggotaKeluarga: true,
      },
    });

    return NextResponse.json(updatedKK);
  } catch (error: unknown) {
    console.error('[KARTU_KELUARGA_PUT]', error);

    // Handle Prisma errors
    if (
      error instanceof Error &&
      (error as PrismaError).code === 'P2002' &&
      (error as PrismaError).meta?.target?.includes('nik')
    ) {
      return NextResponse.json(
        {
          error:
            'NIK sudah terdaftar dalam database. Silakan gunakan NIK yang berbeda.',
        },
        { status: 400 }
      );
    }

    // Handle other specific errors...

    return NextResponse.json(
      {
        error:
          'Terjadi kesalahan saat memproses permintaan. Silakan coba lagi.',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!params.id) {
      return new NextResponse('ID is required', { status: 400 });
    }

    // Delete KK (will cascade delete anggota keluarga)
    const kartuKeluarga = await db.kartuKeluarga.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(kartuKeluarga);
  } catch (error: Error | unknown) {
    console.error('[KARTU_KELUARGA_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
