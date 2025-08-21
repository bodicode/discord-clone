import { useSocket } from "@/components/providers/socket-provider";
import { Member, Message, Profile } from "@prisma/client";
import { useQueryClient, InfiniteData } from "@tanstack/react-query";
import { useEffect } from "react";

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string[]; // chuẩn React Query
};

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
};

export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey,
}: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    // cập nhật message (update)
    socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData<InfiniteData<any>>(queryKey, (oldData) => {
        if (!oldData?.pages?.length) return oldData;

        const newPages = oldData.pages.map((page: any) => ({
          ...page,
          items: page.items.map((item: MessageWithMemberWithProfile) =>
            item.id === message.id ? message : item
          ),
        }));

        return { ...oldData, pages: newPages };
      });
    });

    // thêm message mới (add)
    socket.on(addKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData<InfiniteData<any>>(queryKey, (oldData) => {
        if (!oldData?.pages?.length) {
          return {
            pages: [{ items: [message] }],
            pageParams: [undefined],
          };
        }

        const newPages = [...oldData.pages];
        newPages[0] = {
          ...newPages[0],
          items: [message, ...newPages[0].items],
        };

        return {
          ...oldData,
          pages: newPages,
          pageParams: oldData.pageParams, // giữ nguyên pageParams
        };
      });
    });

    return () => {
      socket.off(addKey);
      socket.off(updateKey);
    };
  }, [queryClient, addKey, updateKey, queryKey, socket]);
};
