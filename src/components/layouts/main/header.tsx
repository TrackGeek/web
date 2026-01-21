import { Bell, Heart, LogIn, LogOut, Mail, Menu, Settings, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import z, { email } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Icon } from '@iconify/react'

import { api, apiEndpoints, type apiTypes } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { extractNameFromEmail, getInitialsFromName } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';

const requestEmailLoginLinkSchema = z.object({
  email: z.email(),
});

type RequestEmailLoginLinkFormData = z.infer<typeof requestEmailLoginLinkSchema>;

export function Header() {
	const { t } = useTranslation();
  
  const auth = useAuth();
  
  const requestEmailLoginLinkForm = useForm<RequestEmailLoginLinkFormData>({
    resolver: zodResolver(requestEmailLoginLinkSchema),
    mode: "onChange",
  });
  
  const meQuery = useQuery<apiTypes.AuthMeResponse>({
    queryKey: ["me"],
    queryFn: () => api.get(apiEndpoints.auth.me).then(({ data }) => data),
    enabled: auth.isAuthenticated,
  });
  
  const name = meQuery.data ? meQuery.data.user.name ?? extractNameFromEmail(meQuery.data.user.email) : "";
  
	return (
		<header className="bg-border/30 backdrop-blur border-b border-border w-full h-14 flex items-center justify-between px-5 py-2">
      <div className="flex items-center justify-center gap-3">
        <Button>
          <Menu />
        </Button>
        
        <Link to="/">
          <img src="/logo.svg" alt="Logo" className="h-full w-45" />
        </Link>
      </div>
      
      <div className="flex items-center justify-center gap-3">
        <Link to="/donate">
          <Button variant={"outline"} className="">
            <Heart color="red" fill="red" />
            {t("common:donate")}
          </Button>
        </Link>
        
        {auth.isAuthenticated ? (
          <>
            {meQuery.isLoading && <Skeleton className="h-8 w-8" />}
          
            {meQuery.data && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className='border border-border size-9'>
                    <AvatarFallback>{getInitialsFromName(name)}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  align="end"
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                          {meQuery.data.user.name ?? extractNameFromEmail(meQuery.data.user.email)}
                        </span>
                        
                        <span className="truncate text-xs">{meQuery.data.user.email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className='cursor-pointer'>
                      <User size={18} className="text-white" />
                      
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link to="/notifications" className='cursor-pointer'>
                      <Bell size={18} className="text-white" />
                      
                      Notifications
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className='cursor-pointer'>
                      <Settings size={18} className="text-white" />
                      
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <button 
                      className='w-full cursor-pointer'
                      onClick={() => auth.logout()}
                    >
                      <LogOut size={18} className="text-white" />
                      
                      Logout
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        ) : (
          <Dialog
            onOpenChange={(open) => {
              if (!open) {
                requestEmailLoginLinkForm.reset();
                requestEmailLoginLinkForm.clearErrors();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="font-semibold">
                <LogIn />
                
                {t("auth:login")}
              </Button>
            </DialogTrigger>
            
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Login</DialogTitle>
                
                <DialogDescription>
                  Choose your login method above to continue.
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex flex-col gap-4">
                <Button
                  className="w-full"
                  disabled={auth.hasLoginPopup}
                  onClick={() => auth.requestLogin('google')}
                >
                  <Icon icon="fa7-brands:google" className='size-5' />
                  
                  Continue with Google
                </Button>
                
                <Button
                  className="w-full"
                  disabled={auth.hasLoginPopup}
                  onClick={() => auth.requestLogin('discord')}
                >
                  <Icon icon="fa7-brands:discord" className='size-5' />
                  
                  Continue with Discord
                </Button>
                
                <Button
                  className="w-full"
                  disabled={auth.hasLoginPopup}
                  onClick={() => auth.requestLogin('github')}
                >
                  <Icon icon="fa7-brands:github" className='size-5' />
                  
                  Continue with Github
                </Button>
                
                <Separator />
                
                <form 
                  className="flex flex-col gap-2"
                  onSubmit={requestEmailLoginLinkForm.handleSubmit(async (formData) => {
                    await auth.requestLogin('email', { email: formData.email });
                    
                    requestEmailLoginLinkForm.reset();
                  })}
                >
                  <Field>
                    <FieldLabel htmlFor='email'>{t("auth:emailAddress")}</FieldLabel>
                  
                    <Input 
                      id="email"
                      type='email'
                      placeholder='jhondoe@example.com'
                      disabled={auth.hasLoginPopup || requestEmailLoginLinkForm.formState.isSubmitting}
                      {...requestEmailLoginLinkForm.register("email")}
                    />
                    
                    {requestEmailLoginLinkForm.formState.errors.email?.message && (
                      <FieldError>{requestEmailLoginLinkForm.formState.errors.email?.message}</FieldError>
                    )}
                  </Field>
                  
                  <Button
                    className="w-full mt-2"
                    disabled={auth.hasLoginPopup || requestEmailLoginLinkForm.formState.isSubmitting}
                  >
                    {requestEmailLoginLinkForm.formState.isSubmitting ? (
                      <Icon className='size-5' icon="line-md:loading-twotone-loop" />
                    ) : (
                      <>
                        <Mail className='size-5' />
                    
                        {t("auth:sendMagicLink")}
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </header>
	);
}
