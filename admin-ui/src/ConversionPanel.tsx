import { ReactElement, useState } from 'react';
import {
	CodeType,
	useAddConversion,
	useDeleteConversion,
	useReadConversions,
	useRunConversion,
} from './api-hooks';
import {
	Alert,
	Box,
	Button,
	FormControl,
	FormControlLabel,
	FormLabel,
	List,
	ListItem,
	ListItemText,
	Radio,
	RadioGroup,
	Skeleton,
	Stack,
	TextField,
} from '@mui/material';
import { Delete } from '@mui/icons-material';

function ConvTextField({
	label,
	value,
	onChange,
	placeholder,
	error,
	helperText,
	required,
}: {
	label: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	placeholder: string;
	error?: boolean;
	helperText?: string;
	required?: boolean;
}): ReactElement {
	return (
		<TextField
			label={label}
			variant="outlined"
			size="small"
			required={required}
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			error={error}
			helperText={helperText}
		/>
	);
}

function AddNewSection(): ReactElement {
	const [pristine, setPristine] = useState(true);
	const [dbPath, setDbPath] = useState('');
	const [schemaPath, setSchemaPath] = useState('');
	const [codeType, setCodeType] = useState('');
	const [memo, setMemo] = useState('');
	const { mutate, isPending, error, isError } = useAddConversion();
	const emptyError = {
		dbPath: (dbPath || '').trim() === '',
		schemaPath: (schemaPath || '').trim() === '',
		codeType: (codeType || '').trim() === '',
	};

	const hasInputError = Object.values(emptyError).some((v) => v);

	return (
		<Box component="article">
			<h2>Save a new conversion</h2>
			<FormControl fullWidth margin="dense">
				<ConvTextField
					label="Source SQLite database path"
					value={dbPath}
					onChange={(e) => {
						setDbPath(e.target.value);
						setPristine(false);
					}}
					placeholder="../path/to/db.sqlite"
					error={!pristine && emptyError.dbPath}
					required
					helperText={
						emptyError.dbPath ? 'Please enter a valid path' : ''
					}
				/>
			</FormControl>
			<FormControl fullWidth margin="dense">
				<ConvTextField
					label="Destination schema folder path"
					value={schemaPath}
					onChange={(e) => {
						setSchemaPath(e.target.value);
						setPristine(false);
					}}
					required
					placeholder="../path/to/converted-schema/*.ts"
					error={!pristine && emptyError.schemaPath}
					helperText={
						emptyError.schemaPath ? 'Please enter a valid path' : ''
					}
				/>
			</FormControl>
			<FormControl
				fullWidth
				margin="dense"
				error={!pristine && emptyError.codeType}
			>
				<FormLabel id="code-type-select-label" required>
					Target schema code type{' '}
					{!pristine && emptyError.codeType && (
						<Alert severity="error">
							Please select a code type
						</Alert>
					)}
				</FormLabel>
				<RadioGroup
					onChange={(e) => {
						setCodeType(e.target.value);
						setPristine(false);
					}}
				>
					<Stack direction="row">
						<FormControlLabel
							value="ts"
							control={<Radio />}
							label="TypeScript"
						/>
						<FormControlLabel
							value="rs"
							control={<Radio />}
							label="Rust"
						/>
					</Stack>
				</RadioGroup>
				<FormControl fullWidth margin="dense">
					<ConvTextField
						label="Memo"
						value={memo}
						onChange={(e) => {
							setMemo(e.target.value);
							setPristine(false);
						}}
						placeholder="Description of the conversion"
					/>
				</FormControl>
				<FormControl margin="dense">
					{isError && (
						<Alert severity="error">{error?.message}</Alert>
					)}
					<Button
						variant="contained"
						color="primary"
						disabled={hasInputError || isPending}
						onClick={() => {
							mutate({
								db_path: dbPath,
								schema_path: schemaPath,
								code_type: codeType as CodeType,
								memo,
							});
						}}
					>
						Save
					</Button>
				</FormControl>
			</FormControl>
		</Box>
	);
}

function ConversionList(): ReactElement {
	const { data, isFetching, isLoading } = useReadConversions();
	const { mutate, isPending } = useDeleteConversion();
	const { mutate: runConversion, isPending: isRunConversionPending } =
		useRunConversion();

	return (
		<Box component="article">
			<h2>Saved Conversions</h2>
			<List>
				{isLoading || isFetching ? (
					<Skeleton />
				) : (
					data?.map((conversion) => (
						<ListItem
							key={conversion.id}
							secondaryAction={
								<Button
									disabled={isPending}
									onClick={() => {
										mutate(conversion.id);
									}}
								>
									<Delete />
								</Button>
							}
						>
							<Box>
								{conversion.memo && (
									<Alert severity="info">
										{conversion.memo}
									</Alert>
								)}
								<ListItemText
									primary={`${conversion.db_path} -> ${conversion.schema_path}/*.${conversion.code_type}`}
								></ListItemText>
								<Button
									variant="outlined"
									onClick={() => runConversion(conversion.id)}
									disabled={isRunConversionPending}
								>
									Convert: GO
								</Button>
							</Box>
						</ListItem>
					))
				)}
			</List>
		</Box>
	);
}

export default function ConversionPanel(): ReactElement {
	return (
		<Box width={'100%'}>
			<ConversionList />
			<AddNewSection />
		</Box>
	);
}
