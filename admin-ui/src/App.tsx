import { ThemeProvider } from '@emotion/react';
import AniClientProvider from './AniClientProvider';
import { aniTheme } from './AniTheme';
import { Box, CssBaseline } from '@mui/material';
import ConversionPanel from './ConversionPanel';

function App() {
	return (
		<AniClientProvider>
			<ThemeProvider theme={aniTheme}>
				<CssBaseline />
				<Box p={2} width={'100%'}>
					<h1>Schema conversion management</h1>
					<ConversionPanel />
				</Box>
			</ThemeProvider>
		</AniClientProvider>
	);
}

export default App;
