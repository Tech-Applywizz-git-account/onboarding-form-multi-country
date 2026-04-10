// import type { Config } from "tailwindcss";

// export default {
// 	darkMode: ["class"],
// 	content: [
// 		"./pages/**/*.{ts,tsx}",
// 		"./components/**/*.{ts,tsx}",
// 		"./app/**/*.{ts,tsx}",
// 		"./src/**/*.{ts,tsx}",
// 	],
// 	prefix: "",
// 	theme: {
// 		container: {
// 			center: true,
// 			padding: '2rem',
// 			screens: {
// 				'2xl': '1400px'
// 			}
// 		},
// 		extend: {
// 			colors: {
// 				border: 'hsl(var(--border))',
// 				input: 'hsl(var(--input))',
// 				ring: 'hsl(var(--ring))',
// 				background: 'hsl(var(--background))',
// 				'background-secondary': 'hsl(var(--background-secondary))',
// 				foreground: 'hsl(var(--foreground))',
// 				primary: {
// 					DEFAULT: 'hsl(var(--primary))',
// 					glow: 'hsl(var(--primary-glow))',
// 					foreground: 'hsl(var(--primary-foreground))'
// 				},
// 				secondary: {
// 					DEFAULT: 'hsl(var(--secondary))',
// 					foreground: 'hsl(var(--secondary-foreground))'
// 				},
// 				accent: {
// 					DEFAULT: 'hsl(var(--accent))',
// 					glow: 'hsl(var(--accent-glow))',
// 					foreground: 'hsl(var(--accent-foreground))'
// 				},
// 				destructive: {
// 					DEFAULT: 'hsl(var(--destructive))',
// 					foreground: 'hsl(var(--destructive-foreground))'
// 				},
// 				success: {
// 					DEFAULT: 'hsl(var(--success))',
// 					glow: 'hsl(var(--success-glow))'
// 				},
// 				warning: 'hsl(var(--warning))',
// 				muted: {
// 					DEFAULT: 'hsl(var(--muted))',
// 					foreground: 'hsl(var(--muted-foreground))'
// 				},
// 				popover: {
// 					DEFAULT: 'hsl(var(--popover))',
// 					foreground: 'hsl(var(--popover-foreground))'
// 				},
// 				card: {
// 					DEFAULT: 'hsl(var(--card))',
// 					glass: 'hsl(var(--card-glass))',
// 					foreground: 'hsl(var(--card-foreground))',
// 					border: 'hsl(var(--card-border))'
// 				},
// 				glass: {
// 					bg: 'hsl(var(--glass-bg))',
// 					border: 'hsl(var(--glass-border))',
// 					shadow: 'hsl(var(--glass-shadow))'
// 				}
// 			},
// 			borderRadius: {
// 				lg: 'var(--radius)',
// 				md: 'calc(var(--radius) - 2px)',
// 				sm: 'calc(var(--radius) - 4px)'
// 			},
// 			keyframes: {
// 				'accordion-down': {
// 					from: {
// 						height: '0'
// 					},
// 					to: {
// 						height: 'var(--radix-accordion-content-height)'
// 					}
// 				},
// 				'accordion-up': {
// 					from: {
// 						height: 'var(--radix-accordion-content-height)'
// 					},
// 					to: {
// 						height: '0'
// 					}
// 				}
// 			},
// 			animation: {
// 				'accordion-down': 'accordion-down 0.2s ease-out',
// 				'accordion-up': 'accordion-up 0.2s ease-out'
// 			}
// 		}
// 	},
// 	plugins: [require("tailwindcss-animate")],
// } satisfies Config;


// // tailwind.config.ts
// import type { Config } from "tailwindcss";

// export default {
//   content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
//   theme: {
//     extend: {
//       colors: {
//         background: "hsl(var(--background))",
//         "background-secondary": "hsl(var(--background-secondary))",
//         foreground: "hsl(var(--foreground))",

//         card: "hsl(var(--card))",
//         "card-glass": "hsl(var(--card-glass))",
//         "card-foreground": "hsl(var(--card-foreground))",
//         "card-border": "hsl(var(--card-border))",

//         primary: "hsl(var(--primary))",
//         "primary-glow": "hsl(var(--primary-glow))",
//         "primary-foreground": "hsl(var(--primary-foreground))",

//         secondary: "hsl(var(--secondary))",
//         "secondary-foreground": "hsl(var(--secondary-foreground))",

//         accent: "hsl(var(--accent))",
//         "accent-glow": "hsl(var(--accent-glow))",
//         "accent-foreground": "hsl(var(--accent-foreground))",

//         success: "hsl(var(--success))",
//         "success-glow": "hsl(var(--success-glow))",
//         warning: "hsl(var(--warning))",
//         destructive: "hsl(var(--destructive))",
//         "destructive-foreground": "hsl(var(--destructive-foreground))",

//         muted: "hsl(var(--muted))",
//         "muted-foreground": "hsl(var(--muted-foreground))",

//         input: "hsl(var(--input))",
//         "input-border": "hsl(var(--input-border))",
//         ring: "hsl(var(--ring))",
//         border: "hsl(var(--border))",

//         popover: "hsl(var(--popover))",
//         "popover-foreground": "hsl(var(--popover-foreground))",
//       },
//       boxShadow: {
//         // now you can use: shadow-glass, shadow-primary, shadow-glow
//         glass: "var(--shadow-glass)",
//         primary: "0 0 30px hsl(var(--primary) / 0.30)",
//         glow: "0 0 40px hsl(var(--primary-glow) / 0.40)",
//       },
//       borderRadius: {
//         DEFAULT: "var(--radius)",
//       },
//     },
//   },
//   plugins: [],
// } satisfies Config;



// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        "background-secondary": "hsl(var(--background-secondary))",
        foreground: "hsl(var(--foreground))",

        card: "hsl(var(--card))",
        "card-glass": "hsl(var(--card-glass))",
        "card-foreground": "hsl(var(--card-foreground))",
        "card-border": "hsl(var(--card-border))",

        primary: "hsl(var(--primary))",
        "primary-glow": "hsl(var(--primary-glow))",
        "primary-foreground": "hsl(var(--primary-foreground))",

        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",

        accent: "hsl(var(--accent))",
        "accent-glow": "hsl(var(--accent-glow))",
        "accent-foreground": "hsl(var(--accent-foreground))",

        success: "hsl(var(--success))",
        "success-glow": "hsl(var(--success-glow))",
        warning: "hsl(var(--warning))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",

        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",

        input: "hsl(var(--input))",
        "input-border": "hsl(var(--input-border))",
        ring: "hsl(var(--ring))",
        border: "hsl(var(--border))",

        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
      },
      boxShadow: {
        // now you can use: shadow-glass, shadow-primary, shadow-glow
        glass: "var(--shadow-glass)",
        primary: "0 0 30px hsl(var(--primary) / 0.30)",
        glow: "0 0 40px hsl(var(--primary-glow) / 0.40)",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
      },
    },
  },
  plugins: [],
} satisfies Config;
