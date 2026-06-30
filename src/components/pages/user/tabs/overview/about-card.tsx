import { useTranslation } from "react-i18next";

interface AboutCardProps {
  about: string;
}

export function AboutCard({ about }: AboutCardProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-card rounded-2xl shadow-lg p-6 flex flex-col gap-2">
      <h4 className="text-md font-semibold text-card-foreground">{t("user:bio")}</h4>
      <p className="text-muted-foreground leading-relaxed">{about}</p>
    </div>
  );
}
