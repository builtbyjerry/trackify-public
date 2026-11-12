export const Colors = {
    primary: "#A1C2BD",   // accent teal
    warning: "#cc475a",   // unchanged for semantic contrast

    dark: {
        text: '#A1C2BD',          // soft teal for readable text
        title: '#E7F2EF',         // light mint for emphasis titles
        background: '#19183B',    // deep navy background
        navBackground: '#1F1E40', // slightly lighter than main bg
        iconColor: '#708993',     // muted gray-blue for default icons
        iconColorFocused: '#E7F2EF', // bright mint when active
        uiBackground: '#25244A',  // mid-tone variation for cards/panels
    },

    light: {
        text: '#708993',          // muted gray-blue for body text
        title: '#19183B',         // deep navy for headlines
        background: '#E7F2EF',    // light mint background
        navBackground: '#DCEAE7', // slightly darker variation
        iconColor: '#708993',        // darker than current #A1C2BD — more readable inactive
        iconColorFocused: '#0F6E56', // your teal accent — strong, familiar
        uiBackground: '#F4FBF9',  // very subtle off-white mint
    },
}
