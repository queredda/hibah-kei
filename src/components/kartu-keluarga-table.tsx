'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Edit, Eye, MoreHorizontal, Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useMediaQuery } from '@/hooks/use-media-query';

// First, let's create an interface for the KartuKeluarga data structure
interface KartuKeluarga {
  id: string;
  noKK: string;
  namaKepalaKeluarga: string;
  alamat: string;
  rt: string | number;
  rw: string | number;
}

interface KartuKeluargaTableProps {
  data: KartuKeluarga[];
}

export function KartuKeluargaTable({ data }: KartuKeluargaTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  // Media queries for responsive design
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');

  // Update column visibility based on screen size
  React.useEffect(() => {
    if (isMobile) {
      setColumnVisibility({
        noKK: true,
        namaKepalaKeluarga: true,
        alamat: false,
        rt: false,
        rw: false,
        actions: true,
      });
    } else if (isTablet) {
      setColumnVisibility({
        noKK: true,
        namaKepalaKeluarga: true,
        alamat: true,
        rt: false,
        rw: false,
        actions: true,
      });
    } else {
      setColumnVisibility({}); // Show all columns on desktop
    }
  }, [isMobile, isTablet]);

  const columns: ColumnDef<KartuKeluarga>[] = [
    {
      accessorKey: 'noKK',
      header: 'No. KK',
      cell: ({ row }) => (
        <div className="max-w-[120px] truncate">{row.getValue('noKK')}</div>
      ),
    },
    {
      accessorKey: 'namaKepalaKeluarga',
      header: 'Nama Kepala Keluarga',
      cell: ({ row }) => (
        <div className="max-w-[150px] truncate">
          {row.getValue('namaKepalaKeluarga')}
        </div>
      ),
    },
    {
      accessorKey: 'alamat',
      header: 'Alamat',
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate">{row.getValue('alamat')}</div>
      ),
    },
    {
      accessorKey: 'rt',
      header: 'RT',
      cell: ({ row }) => <div>{row.getValue('rt')}</div>,
    },
    {
      accessorKey: 'rw',
      header: 'RW',
      cell: ({ row }) => <div>{row.getValue('rw')}</div>,
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const kk = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/kartu-keluarga/${kk.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/kartu-keluarga/${kk.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  setDeleteId(kk.id);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/kartu-keluarga/${deleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      toast({
        title: 'Berhasil',
        description: 'Data Kartu Keluarga berhasil dihapus',
      });

      router.refresh();
    } catch (err) {
      toast({
        title: 'Error',
        description:
          err instanceof Error ? err.message : 'Gagal menghapus data',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  // For mobile, create a card-based view instead of a table
  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center py-4 px-4">
          <Input
            placeholder="Cari No. KK atau nama..."
            value={(table.getColumn('noKK')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('noKK')?.setFilterValue(event.target.value)
            }
            className="w-full"
          />
        </div>

        <div className="space-y-4 px-4">
          {table.getFilteredRowModel().rows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data
            </div>
          ) : (
            table.getFilteredRowModel().rows.map((row) => (
              <div
                key={row.id}
                className="border rounded-md p-4 space-y-2 bg-card"
              >
                <div className="flex justify-between items-center">
                  <div className="font-medium">
                    {row.getValue('namaKepalaKeluarga')}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/dashboard/kartu-keluarga/${row.original.id}`}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat Detail
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/dashboard/kartu-keluarga/${row.original.id}/edit`}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          setDeleteId(row.original.id);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="text-sm text-muted-foreground">
                  No. KK: {row.getValue('noKK')}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between py-4 px-4">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} data
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus data Kartu Keluarga ini?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center py-4 px-4">
        <Input
          placeholder="Cari berdasarkan No. KK atau Nama Kepala Keluarga..."
          value={(table.getColumn('noKK')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('noKK')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border mx-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center px-4"
                >
                  Tidak ada data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4 px-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} data ditemukan
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Selanjutnya
          </Button>
        </div>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data Kartu Keluarga ini?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
