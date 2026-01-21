import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function Footer() {
	const { t } = useTranslation();
  
	return (
		<footer className="bg-border/30 backdrop-blur border-t border-border w-full px-10 py-6">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center justify-center gap-3">
          <Link to="/">
            <img src="/logo.svg" alt="Logo" className="h-full w-45" />
          </Link>
        </div>
        
        <div className="flex flex-row gap-8 lg:gap-12 justify-between w-1/2">
          <div className="flex flex-col gap-3">
            <h3 className="text-accent font-bold">
              {t("common:community")}
            </h3>
            
            <Link to="/">{t("common:addData")}</Link>
            <Link to="/">{t("common:about")}</Link>
            <Link to="/">{t("common:donate")}</Link>
            <Link to="/">{t("common:community")}</Link>
          </div>
          
          <div className="flex flex-col gap-3">
            <h3 className="text-accent font-bold">{t("common:legal")}</h3>
            
            <Link to="/">{t("common:terms")}</Link>
            <Link to="/">{t("common:privacy")}</Link>
          </div>
          
          <div className="flex flex-col gap-3">
            <h3 className="text-accent font-bold">{t("common:socials")}</h3>
            
            <Link to="/" target="_blank">
              BlueSky
            </Link>
            
            <Link to="https://discord.gg/76bcftRnuT" target="_blank">
              Discord
            </Link>
            
            <Link to="/" target="_blank">
              Instagram
            </Link>
            
            <Link to="/" target="_blank">
              X (Twitter)
            </Link>
            
            <Link to="https://github.com/TrackGeek/" target="_blank">
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
	);
}
