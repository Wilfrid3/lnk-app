export interface AxiosError {
    isAxiosError: boolean;
    response?: { data?: { message?: string } };
    message: string;
}