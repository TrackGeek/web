import { type ReactNode, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { AuthContext } from "@/contexts/auth-context";

interface AuthProviderProps {
	children: ReactNode;
}

interface CookieValues {
	"trackgeek-access-token"?: string;
	"trackgeek-refresh-token"?: string;
}

type CookieKeys = keyof CookieValues;

export function AuthProvider({ children }: AuthProviderProps) {
	const [cookies] = useCookies<CookieKeys, CookieValues>(["trackgeek-access-token"]);

	const [isAuthenticated, setAuthenticated] = useState(() => !!cookies?.["trackgeek-access-token"]);

	useEffect(() => {
		setAuthenticated(!!cookies?.["trackgeek-access-token"]);
	}, [cookies?.["trackgeek-access-token"]]);
	return (
		<AuthContext.Provider
			value={{
				isAuthenticated,
				setAuthenticated
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
