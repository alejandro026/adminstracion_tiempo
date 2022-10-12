export interface ModalCloseValue<T> {
    action: 'ok' | 'cancel',
    value?: T
}
