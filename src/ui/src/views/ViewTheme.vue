
<template>
	<div class="view-wrapper view-theme">
		<div class="theme-name">
			<text-input
				v-model="name"
				id="themeName"
				label="Theme Name"
				placeholder="Theme Name"
				icon="type-layer"
			/>
		</div>
		<div class="palette-select">
			<select-menu
				v-model="themePalette"
				id="mainPalette"
				label="Theme Palette"
				:unset="{
					value: '',
					text: '-- Select Palette --'
				}"
				:options="paletteOptions"
				no-options-text="No palettes exist"
				button-icon="theme"
				:selectError="themePaletteError"
				errorText="Selected Palette can not be found"
			>
				<template
					#after-selected="workingOption"
				>
					<template v-if="workingOption.value">
						<template
							v-for="(color, guid) in palettes[workingOption.value].colors"
							:key="guid"
						>
							<color-preview :rgb="color.rgb" />
						</template>
					</template>
				</template>
			</select-menu>
		</div>
		<div class="mixing-color-select">
			<div class="palette-select">
				<select-menu
					v-model="mixingPalette"
					id="mixingPalette"
					label="Theme Mixing Colors"
					:unset="{
						value: '',
						text: '-- Select Palette --'
					}"
					:options="paletteOptions"
					emptyText="No palettes to select from. Please create a palette to populate your mixing colors."
					no-options-text="No palettes exist"
					button-icon="blend-empty"
					:selectError="mixingPaletteError"
					errorText="Selected Palette can not be found"
				>
					<template
						#after-selected="workingOption"
					>
						<template v-if="workingOption.value">
							<template
								v-for="(color, guid) in palettes[workingOption.value].colors"
								:key="guid"
							>
								<color-preview :rgb="color.rgb" />
							</template>
						</template>
					</template>
				</select-menu>
			</div>
		</div>
		<div class="naming-scheme">
			<template-text-input
				v-model="namingScheme"
				id="namingScheme"
				label="Naming Scheme"
				placeholder="Naming Scheme"
				:templates="propTemplates"
				:disabled="false"
			/>
		</div>
		<div class="variations">
			<color-variation
				v-model="variationMapping"
				:colorList="mixingColorList || {}"
				:mixingOptions="mixingOptions"
			/>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, watch, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { usePalettesStore } from '@/stores/palettes'
import { useThemesStore } from '@/stores/themes'
import TextInput from '@/components/form/TextInput.vue'
import SelectMenu from '@/components/form/SelectMenu.vue'
import ColorVariation from '@/components/form/ColorVariation.vue'
import TemplateTextInput from '@/components/form/TemplateTextInput.vue'
import ColorPreview from '@/components/general/ColorPreview.vue'
import { SelectOption } from '@/types/SelectOption'
import { hexStringFromRGB } from '@/utils/hexStringFromRGB'
import { propTemplates } from '@/data/nameSchemeTemplates'


export default defineComponent( {
	components: {
		TextInput,
		ColorVariation,
		TemplateTextInput,
		SelectMenu,
		ColorPreview,
	},
	props: {
		guid: {
			type: String,
			required: true,
		},
	},
	setup( props ) {
		const appStore = useAppStore()

		const themeStore = useThemesStore()

		const curTheme = computed( () => themeStore.themes[props.guid] )

		const name = computed( {
			get: () => curTheme.value.name,
			set: ( val ) => {
				curTheme.value.name = val
			},
		} )
		const themePalette = computed( {
			get: () => curTheme.value.themePalette,
			set: ( val ) => {
				curTheme.value.themePalette = val
			},
		} )
		const mixingPalette = computed( {
			get: () => curTheme.value.mixingPalette,
			set: ( val ) => {
				curTheme.value.mixingPalette = val
			},
		} )
		const namingScheme = computed( {
			get: () => curTheme.value.namingScheme,
			set: ( val ) => {
				curTheme.value.namingScheme = val
			},
		} )
		const variationMapping = computed( {
			get: () => curTheme.value.variationMapping,
			set: ( val ) => {
				curTheme.value.variationMapping = val
			},
		} )

		const paletteStore = usePalettesStore()
		const palettes = paletteStore.palettes
		const paletteCount = computed( () => {
			return Object.keys( palettes ).length
		} )
		const paletteOptions = computed( () => {
			const options: SelectOption[] = []
			for( const palette in palettes ) {
				const formattedOption = {
					value: palettes[palette].guid,
					text: palettes[palette].name || 'Untitled Palette',
				}
				options.push( formattedOption )
			}
			return options
		} )

		watch(
			() => name.value,
			( name ) => {
				appStore.setHeaderTitle( name )
			}
		)

		const themePaletteError = computed( () => {
			// We don't want to show an error if it's empty or undefined
			if( themePalette.value ) {
				if( palettes[themePalette.value] ) {
					return false
				}
				// Only return here if themePalette is non-falsy value and value doesn't exist in palettes
				return true
			}
			return false
		} )

		const mixingPaletteError = computed( () => {
			// We don't want to show an error if it's empty or undefined
			if( mixingPalette.value ) {
				if( palettes[mixingPalette.value] ) {
					return false
				}
				// Only return here if mixingPalette is non-falsy value and value doesn't exist in palettes
				return true
			}
			return false
		} )

		const mixingColorList = computed( () => {
			if( mixingPalette.value && !mixingPaletteError.value ) {

				return palettes[mixingPalette.value].colors
			}
			return false
		} )

		const mixingOptions = computed( ()=> {
			if( mixingColorList.value ) {

				const options: SelectOption[] = []
				for( const color in mixingColorList.value ) {
					const formattedOption = {
						value: mixingColorList.value[color].guid,
						text: mixingColorList.value[color].name || hexStringFromRGB( mixingColorList.value[color].rgb ),
					}
					options.push( formattedOption )
				}
				if( options.length > 0 ) {
					return options
				}
				return [{
					value: '',
					text: 'No colors defined',
				}]
			}
			return []
		} )

		return {
			name,
			themePalette,
			palettes,
			mixingOptions,
			mixingPalette,
			namingScheme,
			mixingColorList,
			variationMapping,
			paletteCount,
			paletteOptions,
			hexStringFromRGB,
			themePaletteError,
			mixingPaletteError,
			propTemplates,
		}
	},
} )
</script>