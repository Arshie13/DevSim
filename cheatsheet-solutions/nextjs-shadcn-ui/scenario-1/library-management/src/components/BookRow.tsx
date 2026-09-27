'use client';

import { Book } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';

interface BookRowProps {
  book: Book;
  /** Called when the librarian clicks Borrow for an available book. */
  onBorrow?: (book: Book) => void;
}

/** Distinct badge colours per book status (Level 2.1 bug fix). */
const STATUS_CLASSES: Record<Book['status'], string> = {
  available: 'bg-green-100 text-green-800',
  borrowed: 'bg-blue-100 text-blue-800',
  overdue: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<Book['status'], string> = {
  available: 'Available',
  borrowed: 'Borrowed',
  overdue: 'Overdue',
};

export default function BookRow({ book, onBorrow }: BookRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{book.title}</TableCell>
      <TableCell>{book.author}</TableCell>
      <TableCell>{book.isbn}</TableCell>
      <TableCell>
        <Badge className={STATUS_CLASSES[book.status]}>
          {STATUS_LABELS[book.status]}
        </Badge>
      </TableCell>
      <TableCell>{book.borrowedBy || '-'}</TableCell>
      <TableCell>
        {book.status === 'available' && (
          <Button size="sm" onClick={() => onBorrow?.(book)}>
            Borrow
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
