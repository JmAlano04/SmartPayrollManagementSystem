import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

// Components...
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({ password: '' });

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        clearErrors();
        reset();
    };

    return (
        <div className="space-y-4 rounded-2xl border border-red-200/80 bg-gradient-to-br from-red-50 via-white to-[#fff6f6] p-4 shadow-sm dark:border-red-500/20 dark:from-red-950/20 dark:via-[#121829] dark:to-[#121829]">
            <div className="space-y-1 text-red-700 dark:text-red-100">
                <p className="text-sm font-semibold">Warning</p>
                <p className="text-sm text-red-600/90 dark:text-red-200/90">Please proceed with caution — this cannot be undone.</p>
            </div>

            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-[#0B0F1A]"
                    >
                        Delete account
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogTitle className="text-left text-lg font-semibold text-[#0B0F1A] dark:text-white">
                        Are you sure you want to delete your account?
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-600 dark:text-white/70">
                        Once your account is deleted, all of its resources and data will also be permanently deleted. Please enter your
                        password to confirm you would like to permanently delete your account.
                    </DialogDescription>
                    <form className="space-y-6" onSubmit={deleteUser}>
                        <div className="grid gap-2">
                            <Label htmlFor="password" className="sr-only">
                                Password
                            </Label>

                            <Input
                                id="password"
                                type="password"
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#C6F432] focus:ring-2 focus:ring-[#C6F432]/25 focus-visible:ring-[#C6F432]/25 disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
                                placeholder="Password"
                                autoComplete="current-password"
                            />

                            <InputError message={errors.password} />
                        </div>

                        <DialogFooter className="gap-2 sm:justify-end">
                            <DialogClose asChild>
                                <Button type="button" variant="secondary" className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10" onClick={closeModal}>
                                    Cancel
                                </Button>
                            </DialogClose>

                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={processing}
                                className="bg-red-600 text-white hover:bg-red-500 dark:bg-red-600 dark:hover:bg-red-500"
                            >
                                {processing ? 'Deleting…' : 'Delete account'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
