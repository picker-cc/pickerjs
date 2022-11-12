// Validate there is a user with a valid session
// const isUser = ({ session }: { session: Session }) =>
//   !!session?.data.id;
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
  isUser: ({ session }: AccessArgs) => Boolean(session?.data.id),
  isSelf: ({ session, item }: AccessArgs) => {
    // console.log(session)
    // return false
    // console.log(session)
    // console.log(item)
    return session.itemId === item.userId;
    // return false
  }
};
