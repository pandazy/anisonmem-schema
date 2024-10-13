import { QueryClient, QueryClientProvider} from '@tanstack/react-query';
import { ReactElement } from 'react';

export default function AniClientProvider({
    children,
}: {
    children: React.ReactNode;
}): ReactElement {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

}