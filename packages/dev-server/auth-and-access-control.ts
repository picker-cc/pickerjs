interface AccessArgs {
  session?: {
    itemId?: string;
    listKey?: string;
    data: {
      id?: string;
      name?: string;
      isAdmin: boolean;
    };
  };
  item?: any;
}

export const access = {
  isAdmin: ({ session }: AccessArgs) => Boolean(session?.data.isAdmin),
  isUser: ({ session }: AccessArgs) => {
    // console.log(session)
    return Boolean(session?.itemId);
  },
  isSelf: ({ session, item }: AccessArgs) => {
    if (session) {
      return session.itemId === item.userId;
    }
    return false;
  }
};
