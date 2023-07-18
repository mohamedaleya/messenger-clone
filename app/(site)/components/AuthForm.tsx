'use client';

import Button from '@/app/components/Button';
import Input from '@/app/components/Inputs/Input';
import AuthSocialButton from './AuthSocialButton';

import { useCallback, useEffect, useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';

import axios from 'axios';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { BsGithub, BsGoogle } from 'react-icons/bs';

type Variant = 'LOGIN' | 'REGISTER';

const AuthForm = () => {
  const session = useSession();
  const router = useRouter();
  const [variant, setVariant] = useState<Variant>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.status === 'authenticated') {
      router.push('/users');
    }
  }, [session?.status, router]);

  const toggleVariant = useCallback(() => {
    setVariant((prev) => (prev === 'LOGIN' ? 'REGISTER' : 'LOGIN'));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    if (variant === 'REGISTER') {
      axios
        .post('/api/register', data)
        .then(() => signIn('credentials', data))
        .catch(() => toast.error('Something went wrong.'))
        .finally(() => setIsLoading(false));
    }

    if (variant === 'LOGIN') {
      signIn('credentials', {
        ...data,
        redirect: false,
      })
        .then((callback) => {
          if (callback?.error) {
            toast.error('Invalid credentials.');
          }

          if (callback?.ok && !callback?.error) {
            toast.success('Successfully logged in.');
            router.push('/users');
          }
        })
        .finally(() => setIsLoading(false));
    }
  };

  const socialAction = (action: string) => {
    setIsLoading(true);

    signIn(action, { redirect: false })
      .then((callback) => {
        if (callback?.error) {
          toast.error('Invalid credentials');
        }

        if (callback?.ok && !callback?.error) {
          toast.success('Successfully logged in.');
        }
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div
      className="mt-8
  sm:mx-auto
  sm:w-full
  sm:max-w-md"
    >
      <div
        className="bg-white
        px-7
    py-8
    shadow
    sm:rounded-lg
    sm:px-10"
      >
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {variant === 'REGISTER' && (
            <Input
              id="name"
              label="Name"
              disabled={isLoading}
              register={register}
              errors={errors}
            />
          )}
          <Input
            id="email"
            label="Email address"
            type="email"
            disabled={isLoading}
            register={register}
            errors={errors}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            disabled={isLoading}
            register={register}
            errors={errors}
          />
          <div>
            <Button disabled={isLoading} fullWidth type="submit">
              {variant === 'LOGIN' ? 'Sign in' : 'Register'}
            </Button>
          </div>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div
              className="
                absolute 
                inset-0 
                flex 
                items-center
              "
            >
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <AuthSocialButton
              icon={BsGithub}
              onClick={() => socialAction('github')}
            />
            <AuthSocialButton
              icon={BsGoogle}
              onClick={() => socialAction('google')}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-center gap-2 px-2 text-sm text-gray-500">
          <div>
            {variant === 'LOGIN'
              ? 'New to Messenger?'
              : 'Already have an account?'}
          </div>
          <div onClick={toggleVariant} className="cursor-pointer underline">
            {variant === 'LOGIN' ? 'Create an account' : 'Login'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
