import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    // Ledger-line input style: underline only, no box — echoes filling in a paper form.
    const ledgerInput =
        'rounded-none border-0 border-b border-[#16241C]/20 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:border-[#2F6B4F] dark:border-[#EAF2EC]/20 dark:focus-visible:border-[#5FA37F]';

    return (
        <>
            <Head title="Register">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=fraunces:400,500,600|ibm-plex-sans:400,500,600|ibm-plex-mono:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <div className="grid min-h-screen font-['IBM_Plex_Sans'] md:grid-cols-2">
                {/* Brand panel */}
                <div className="relative hidden flex-col justify-between bg-[#16241C] p-10 text-[#EFF5F0] md:flex dark:bg-[#0A130D]">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-[#EFF5F0]/30 font-['IBM_Plex_Mono'] text-xs">
                            §
                        </span>
                        <span className="font-['Fraunces'] text-lg font-medium">SmartPayroll</span>
                    </Link>

                    <div className="max-w-sm">
                        <p className="font-['Fraunces'] text-3xl leading-tight font-medium text-balance">
                            Every payslip checked before it&apos;s paid.
                        </p>
                        <p className="mt-4 text-sm leading-6 text-[#EFF5F0]/70">
                            Automated tax calculations, anomaly detection, and camera clock-in — payroll you don&apos;t have
                            to double-check.
                        </p>
                    </div>

                    <p className="font-['IBM_Plex_Mono'] text-xs text-[#EFF5F0]/50">12,400+ payslips verified</p>
                </div>

                {/* Form panel */}
                <div className="flex items-center justify-center bg-[#EFF5F0] px-6 py-12 dark:bg-[#0E1712] dark:text-[#EAF2EC]">
                    <div className="w-full max-w-sm">
                        <h1 className="font-['Fraunces'] text-2xl font-medium">Create an account</h1>
                        <p className="mt-2 text-sm text-[#16241C]/70 dark:text-[#EAF2EC]/70">
                            Enter your details below to create your account
                        </p>

                        <form className="mt-8 flex flex-col gap-6" onSubmit={submit}>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        disabled={processing}
                                        placeholder="Full name"
                                        className={ledgerInput}
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        disabled={processing}
                                        placeholder="email@example.com"
                                        className={ledgerInput}
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        disabled={processing}
                                        placeholder="Password"
                                        className={ledgerInput}
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">Confirm password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        disabled={processing}
                                        placeholder="Confirm password"
                                        className={ledgerInput}
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>

                                <Button
                                    type="submit"
                                    className="mt-2 w-full rounded-md bg-[#16241C] text-[#EFF5F0] hover:bg-[#233A2B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F6B4F] dark:bg-[#EAF2EC] dark:text-[#16241C] dark:hover:bg-white"
                                    tabIndex={5}
                                    disabled={processing}
                                >
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Create account
                                </Button>
                            </div>

                            <div className="text-center text-sm text-[#16241C]/70 dark:text-[#EAF2EC]/70">
                                Already have an account?{' '}
                                <TextLink href={route('login')} tabIndex={6}>
                                    Log in
                                </TextLink>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}