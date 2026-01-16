import { useTranslation } from 'react-i18next';

import { Layout } from "@/components/layouts/main";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LANGUAGE_TOKEN, supportedLanguages } from '@/lib/i18n/config';

export function HomePage() {
  const { t, i18n } = useTranslation();
  
	return (
		<Layout title="Home">
			<div className="flex gap-5">
				<div className="flex flex-col w-4/5">
					<Tabs defaultValue="following">
						<TabsList className="w-1/3 mx-auto">
							<TabsTrigger value="following">Following</TabsTrigger>
							<TabsTrigger value="global">Global</TabsTrigger>
							<TabsTrigger value="trending">Trending</TabsTrigger>
						</TabsList>
						<TabsContent value="following"></TabsContent>
						<TabsContent value="global"></TabsContent>
						<TabsContent value="trending"></TabsContent>
					</Tabs>
				</div>
				<div className="flex flex-col gap-4 w-1/5">
					<h1>Sidebar</h1>
          
          <p>{t('common:yes')}/{t('common:no')}</p>
          
          <span className='font-bold'>{t('common:example', { name: 'Jhon Doe' })}</span>
          
          <select 
            className="p-2 border rounded-md"
            value={i18n.language}
            onChange={(e) => {
              i18n.changeLanguage(e.target.value)
              
              localStorage.setItem(LANGUAGE_TOKEN, e.target.value);
            }}
          >
            {supportedLanguages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {t(lang.name as any)}
              </option>
            ))}
          </select>
				</div>
			</div>
		</Layout>
	);
}
