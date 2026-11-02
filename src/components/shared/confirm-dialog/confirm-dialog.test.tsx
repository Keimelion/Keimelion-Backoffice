import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { ConfirmDialog } from './confirm-dialog'

function DialogFixture(): React.JSX.Element {
  return (
    <Dialog>
      <DialogTrigger>Open Dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogHeader>
        <p>Dialog body content</p>
      </DialogContent>
    </Dialog>
  )
}

function SheetFixture({ side }: { side: 'left' | 'right' | 'top' | 'bottom' }): React.JSX.Element {
  return (
    <Sheet>
      <SheetTrigger>Open Sheet</SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Sheet Title</SheetTitle>
        </SheetHeader>
        <p>Sheet body content</p>
      </SheetContent>
    </Sheet>
  )
}

function AlertDialogFixture(): React.JSX.Element {
  return (
    <AlertDialog>
      <AlertDialogTrigger>Open Alert</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm action</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function ConfirmDialogFixture({
  onConfirm,
  destructive = false,
}: {
  onConfirm: () => void | Promise<void>
  destructive?: boolean
}): React.JSX.Element {
  const [open, setOpen] = useState<boolean>(false)
  return (
    <>
      <button onClick={() => { setOpen(true) }}>Open Confirm</button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete item?"
        description="This action cannot be undone."
        onConfirm={onConfirm}
        destructive={destructive}
      />
    </>
  )
}

describe('Dialog primitive', () => {
  it('opens when the trigger is clicked', async () => {
    const user = userEvent.setup()
    render(<DialogFixture />)
    await user.click(screen.getByText('Open Dialog'))
    expect(screen.getByText('Dialog body content')).toBeInTheDocument()
  })

  it('closes when ESC is pressed', async () => {
    const user = userEvent.setup()
    render(<DialogFixture />)
    await user.click(screen.getByText('Open Dialog'))
    expect(screen.getByText('Dialog body content')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByText('Dialog body content')).not.toBeInTheDocument()
    })
  })

  it('closes when the close button is clicked (backdrop dismissal is wired by default)', async () => {
    const user = userEvent.setup()
    render(<DialogFixture />)
    await user.click(screen.getByText('Open Dialog'))
    expect(screen.getByText('Dialog body content')).toBeInTheDocument()
    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)
    await waitFor(() => {
      expect(screen.queryByText('Dialog body content')).not.toBeInTheDocument()
    })
  })
})

describe('Sheet primitive', () => {
  it('opens with the correct side', async () => {
    const user = userEvent.setup()
    render(<SheetFixture side="left" />)
    await user.click(screen.getByText('Open Sheet'))
    const content = screen.getByText('Sheet body content').closest('[data-state="open"]')
    expect(content).toBeInTheDocument()
  })

  it('closes when ESC is pressed', async () => {
    const user = userEvent.setup()
    render(<SheetFixture side="right" />)
    await user.click(screen.getByText('Open Sheet'))
    expect(screen.getByText('Sheet body content')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByText('Sheet body content')).not.toBeInTheDocument()
    })
  })
})

describe('AlertDialog primitive', () => {
  it('does not close when the backdrop is clicked', async () => {
    const user = userEvent.setup()
    render(<AlertDialogFixture />)
    await user.click(screen.getByText('Open Alert'))
    expect(screen.getByText('Confirm action')).toBeInTheDocument()
    const overlay = document.querySelector('[data-radix-alert-dialog-overlay]')
    if (overlay instanceof HTMLElement) await user.click(overlay)
    expect(screen.getByText('Confirm action')).toBeInTheDocument()
  })

  it('closes when Cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<AlertDialogFixture />)
    await user.click(screen.getByText('Open Alert'))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(screen.queryByText('Confirm action')).not.toBeInTheDocument()
    })
  })

  it('closes when Confirm is clicked', async () => {
    const user = userEvent.setup()
    render(<AlertDialogFixture />)
    await user.click(screen.getByText('Open Alert'))
    await user.click(screen.getByRole('button', { name: 'Confirm' }))
    await waitFor(() => {
      expect(screen.queryByText('Confirm action')).not.toBeInTheDocument()
    })
  })
})

describe('ConfirmDialog', () => {
  it('closes without calling onConfirm when Cancel is clicked', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(<ConfirmDialogFixture onConfirm={onConfirm} />)
    await user.click(screen.getByText('Open Confirm'))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(screen.queryByText('Delete item?')).not.toBeInTheDocument()
    })
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('calls onConfirm and closes when Confirm is clicked', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(<ConfirmDialogFixture onConfirm={onConfirm} />)
    await user.click(screen.getByText('Open Confirm'))
    await user.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(onConfirm).toHaveBeenCalledOnce()
    await waitFor(() => {
      expect(screen.queryByText('Delete item?')).not.toBeInTheDocument()
    })
  })

  it('disables both buttons while async onConfirm is pending', async () => {
    let resolveConfirm!: () => void
    const onConfirm = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveConfirm = resolve
        }),
    )
    const user = userEvent.setup()
    render(<ConfirmDialogFixture onConfirm={onConfirm} />)
    await user.click(screen.getByText('Open Confirm'))
    await user.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    resolveConfirm()
    await waitFor(() => {
      expect(screen.queryByText('Delete item?')).not.toBeInTheDocument()
    })
  })

  it('applies destructive variant to the confirm button when destructive is true', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(<ConfirmDialogFixture onConfirm={onConfirm} destructive />)
    await user.click(screen.getByText('Open Confirm'))
    const confirmButton = screen.getByRole('button', { name: 'Confirm' })
    expect(confirmButton.className).toContain('destructive')
  })
})
