import { defineStore } from 'pinia'
import { Theme, Themes } from '../types/Theme'
import { v4 as uuidv4 } from 'uuid'
import { readLocal } from '../utils/localStorage'
import { useAppStore } from './app'

const themeStorageKey = 'theme-styles-themes'

// Grab initial theme state, or set to empty
const themes: Themes = await readLocal( themeStorageKey ) || {}

export const useThemesStore = defineStore( {
	id: 'themes',
	state: () => ( {
		themes,
	} ),
	getters: {

	},
	actions: {
		addTheme(): Theme {
			const guid = uuidv4()
			const appStore = useAppStore()
			const newTheme = {
				guid,
				name: 'Untitled Theme',
				namingScheme: '%{theme-name}/%{color-name}-%{label}',
				variationMapping: [],
			}
			this.themes[guid] = newTheme
			appStore.setAppView( 'theme', newTheme.name, guid )
			return newTheme
		},
		updateTheme( guid: string ) {
			//...
		},
	},
} )