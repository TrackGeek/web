import { useEffect, useState } from "react";

interface Star {
	id: number;
	size: number;
	x: number;
	y: number;
	opacity: number;
	delay: number;
	duration: number;
}

export function StarsBackground() {
	const [stars, setStars] = useState<Star[]>([]);

	useEffect(() => {
		const generateStars = () => {
			const starsCount = 150;
			const newStars: Star[] = [];

			for (let i = 0; i < starsCount; i++) {
				newStars.push({
					id: i,
					size: Math.random() * 3 + 1,
					x: Math.random() * 100,
					y: Math.random() * 100,
					opacity: Math.random() * 0.7 + 0.3,
					delay: Math.random() * 5,
					duration: Math.random() * 10 + 5,
				});
			}

			setStars(newStars);
		};

		generateStars();
	}, []);

	return (
		<div className="fixed inset-0 overflow-hidden z-[-1] pointer-events-none">
			<div
				className="absolute inset-0 animate-gradient-shift bg-linear-to-b from-black to-zinc-700 bg-size-[400%_400%]"
				style={{
					animation: "gradientShift 15s ease infinite",
				}}
			/>

			<div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-black/20" />

			{stars.map((star) => (
				<div
					key={star.id}
					className="absolute rounded-full bg-white animate-twinkle"
					style={{
						left: `${star.x}%`,
						top: `${star.y}%`,
						width: `${star.size}px`,
						height: `${star.size}px`,
						opacity: star.opacity,
						animationDelay: `${star.delay}s`,
						animationDuration: `${star.duration}s`,
					}}
				/>
			))}
		</div>
	);
}
