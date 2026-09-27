'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockBooks, Book, Librarian } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLocalStorage } from '@/hooks/useLocalStorage';

/**
 * Returns desk — lists every currently borrowed book and lets the librarian
 * process a return after a confirmation step.
 */
export default function ReturnsPage() {
  const [librarian, setLibrarian] = useState<Librarian | null>(null);
  const [books, setBooks] = useLocalStorage<Book[]>('books', mockBooks);
  const [bookToReturn, setBookToReturn] = useState<Book | null>(null);
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

  const borrowedBooks = books.filter((book) => book.status === 'borrowed');

  /** Flip the book back to available and drop its borrower details. */
  const confirmReturn = () => {
    if (!bookToReturn) return;

    setBooks(
      books.map((book) =>
        book.id === bookToReturn.id
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
    setBookToReturn(null);
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
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-serif font-bold text-amber-900 dark:text-amber-100 mb-6">
          Returns
        </h1>

        <Card className="border-amber-200 dark:border-amber-800">
          {borrowedBooks.length === 0 ? (
            <div className="p-12 text-center text-amber-600 dark:text-amber-400">
              No borrowed books to return
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Borrowed By</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {borrowedBooks.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{book.borrowedBy}</TableCell>
                    <TableCell>{book.dueDate}</TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => setBookToReturn(book)}>
                        Return
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </main>

      {/* Confirmation dialog */}
      {bookToReturn && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
              Are you sure?
            </h2>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">
              Process the return for &ldquo;{bookToReturn.title}&rdquo;?
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setBookToReturn(null)}>
                Cancel
              </Button>
              <Button onClick={confirmReturn}>Confirm</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
