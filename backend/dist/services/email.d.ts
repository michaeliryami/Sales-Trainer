interface InvitationEmailData {
    to: string;
    organizationName: string;
    inviterName: string;
    role: 'admin' | 'employee';
    inviteUrl: string;
}
export declare function sendInvitationEmail(data: InvitationEmailData): Promise<void>;
declare const _default: {
    sendInvitationEmail: typeof sendInvitationEmail;
};
export default _default;
//# sourceMappingURL=email.d.ts.map