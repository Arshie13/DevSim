'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockBooks, mockBorrowRecords, Book, Librarian } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLocalStorage } from '@/hooks/useLocalStorage';

/** Whole days between the due date and today (never negative). */
function daysOverdue(dueDate?: string): number {
  if (!dueDate) return 0;

  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 0);
}

/**
 * Overdue report — lists overdue books with borrower contact details and a
 * "Mark as Returned" action that clears the book from the report.
 */
export default function OverduePage() {
  const [librarian, setLibrarian] = useState<Librarian | null>(null);
  const [books, setBooks] = useLocalStorage<Book[]>('books', mockBooks);
  const router = useRouter();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const stored = localStorage.getItem('librarian');
    if (stored) {
      try {
        setLibrarian(JSON.parse(stored));
      } catch {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const overdueBooks = books.filter((book) => book.status === 'overdue');

  const markReturned = (bookId: string) => {
    setBooks(
      books.map((book) =>
        book.id === bookId
          ? {
              ...book,
              status: 'available' as const,
              borrowedBy: undefined,
              borrowedDate: undefined,
              dueDate: undefined,
            }
          : book
      )
    );
  };

  if (!librarian) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-amber-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 dark:bg-amber-950">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-serif font-bold text-amber-900 dark:text-amber-100 mb-6">
          Overdue Report
        </h1>

        <Card className="border-amber-200 dark:border-amber-800">
          {overdueBooks.length === 0 ? (
            <div className="p-12 text-center text-amber-600 dark:text-amber-400">
              No overdue books
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Days Overdue</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueBooks.map((book) => {
                  const record = mockBorrowRecords.find((r) => r.bookId === book.id);

                  return (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>{book.borrowedBy}</TableCell>
                      <TableCell>{record?.borrowerEmail ?? '-'}</TableCell>
                      <TableCell className="font-medium text-red-600">
                        {daysOverdue(book.dueDate)} days overdue
                      </TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => markReturned(book.id)}>
                          Mark as Returned
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      </main>
    </div>
  );
}
