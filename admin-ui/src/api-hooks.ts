import {
	QueryClient,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';

const SERVER = 'http://127.0.0.1:5000';

export type CodeType = 'rs' | 'ts';

export interface NewConversion {
	db_path: string;
	schema_path: string;
	code_type: CodeType;
	memo?: string;
}

export interface Conversion extends NewConversion {
	id: number;
}

const QUERY_ALL_KEY = 'conversion_list';
const QUERY_ALL_URL = [SERVER, QUERY_ALL_KEY].join('/');
export function useReadConversions() {
	return useQuery<Conversion[]>({
		queryKey: [QUERY_ALL_KEY],
		queryFn: async () => {
			const response = await fetch(QUERY_ALL_URL);
			if (!response.ok) {
				const resp = await response.json();
				throw new Error(resp?.message);
			}
			return response.json();
		},
	});
}

function getCommonMutateOptions(client: QueryClient) {
	return {
		onError: (_: Error, __: unknown, context: unknown) => {
			if (context) {
				client.setQueryData([QUERY_ALL_KEY], context);
			}
		},
		onSettled: () => {
			client.invalidateQueries({ queryKey: [QUERY_ALL_KEY] });
		},
	};
}

export function useAddConversion() {
	const queryClient = useQueryClient();
	return useMutation({
		...getCommonMutateOptions(queryClient),
		mutationFn: async (conversion: NewConversion) => {
			const response = await fetch([SERVER, 'conversion'].join('/'), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(conversion),
			});
			if (!response.ok) {
				const resp = await response.json();
				throw new Error(resp?.message);
			}
			return response.json();
		},
		onMutate: async (conversion: NewConversion) => {
			await queryClient.cancelQueries({ queryKey: [QUERY_ALL_KEY] });
			const previousConversions = queryClient.getQueryData<Conversion[]>([
				QUERY_ALL_KEY,
			]);
			queryClient.setQueryData<Conversion[]>([QUERY_ALL_KEY], (old) => {
				return old
					? [
							...old,
							{
								...conversion,
								id: previousConversions?.length ?? 0,
							},
					  ]
					: [];
			});
			return previousConversions;
		},
	});
}

export function useDeleteConversion() {
	const queryClient = useQueryClient();

	return useMutation({
		...getCommonMutateOptions(queryClient),
		mutationFn: async (id: number) => {
			const response = await fetch([SERVER, 'conversion', id].join('/'), {
				method: 'DELETE',
			});
			if (!response.ok) {
				const resp = await response.json();
				throw new Error(resp?.message);
			}
			return response.json();
		},
		onMutate: async (id) => {
			await queryClient.cancelQueries({ queryKey: ['records'] });
			const previousConversions = queryClient.getQueryData<Conversion[]>([
				QUERY_ALL_KEY,
			]);
			queryClient.setQueryData<Conversion[]>([QUERY_ALL_KEY], (old) => {
				return old?.filter((conv) => conv.id !== id) ?? [];
			});
			return previousConversions;
		},
	});
}

export function useRunConversion() {
	const queryClient = useQueryClient();
	return useMutation({
		...getCommonMutateOptions(queryClient),
		mutationFn: async (id: number) => {
			const response = await fetch(
				[SERVER, 'run_conversion', id].join('/'),
				{
					method: 'POST',
				},
			);
			if (!response.ok) {
				const resp = await response.json();
				throw new Error(resp?.message);
			}
			return response.json();
		},
	});
}
