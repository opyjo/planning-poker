"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw, Eye, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/header";
import { VotingCard } from "@/components/room/voting-card";
import { ParticipantCard } from "@/components/room/participant-card";
import { ResultsTable } from "@/components/room/results-table";
import { TimerDisplay } from "@/components/room/timer-display";
import { ShareDialog } from "@/components/room/share-dialog";
import { JoinDialog } from "@/components/room/join-dialog";
import { RoomSettingsDialog } from "@/components/room/room-settings-dialog";
import { VotingProgress } from "@/components/room/voting-progress";
import { UserMenu } from "@/components/room/user-menu";
import { StoryInput } from "@/components/room/story-input";
import { useUser } from "@/components/providers/user-provider";
import { useSocket } from "@/components/providers/socket-provider";
import { useToast } from "@/hooks/use-toast";
import {
  DECK_OPTIONS,
  DEFAULT_ROOM_SETTINGS,
  type Participant,
  type VoteResult,
  type DeckType,
  type ConfidenceLevel,
  type RoomSettings,
} from "@/lib/types";
import { getRecentRooms, updateRecentRoom } from "@/lib/storage";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const { userName, setUserName } = useUser();
  const { roomState, sendEvent, joinRoom, leaveRoom } = useSocket();
  const { toast } = useToast();
  const roomId = params.id as string;

  // Local UI state
  const [showJoinDialog, setShowJoinDialog] = useState(true);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<Participant | null>(null);
  const [selectedVote, setSelectedVote] = useState<string | undefined>();
  const [selectedConfidence, setSelectedConfidence] = useState<
    ConfidenceLevel | undefined
  >();
  const [isJoining, setIsJoining] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isStartingNewRound, setIsStartingNewRound] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Refs for stable access in cleanup effects
  const currentUserRef = useRef<Participant | null>(null);
  const autoJoinAttemptedRef = useRef(false);

  // Keep currentUser ref in sync
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // localStorage fallback values (shown before server responds)
  const [storedRoomName, setStoredRoomName] = useState("Loading...");
  const [storedDeckType, setStoredDeckType] = useState<DeckType>("fibonacci");

  useEffect(() => {
    setIsMounted(true);
    const room = getRecentRooms().find((r) => r.id === roomId);
    if (room) {
      setStoredRoomName(room.name || "Planning Poker Session");
      setStoredDeckType(room.deckType || "fibonacci");
    } else {
      setStoredRoomName("Planning Poker Session");
    }
  }, [roomId]);

  // Derive state from server (source of truth), with localStorage fallbacks
  const participants = roomState?.participants || [];
  const votesRevealed = roomState?.votesRevealed || false;
  const timerActive = roomState?.timerActive || false;
  const currentStory = roomState?.currentStory;
  const moderatorId = roomState?.moderatorId || null;
  const roomSettings = roomState?.settings || DEFAULT_ROOM_SETTINGS;
  const deckType = roomState?.deckType || storedDeckType;
  const roomName = roomState?.roomName || storedRoomName;
  const timerDuration = roomState?.timerDuration;
  const timerStartedAt = roomState?.timerStartedAt;

  const deckValues = DECK_OPTIONS[deckType]?.values || DECK_OPTIONS.fibonacci.values;

  const voters = participants.filter((p) => !p.isSpectator);
  const votedCount = voters.filter((p) => p.vote).length;
  const allVoted = voters.length > 0 && voters.every((p) => p.vote);

  const isModerator = currentUser?.id === moderatorId;

  // Clear local vote selection when a new round starts (syncs across all clients)
  const prevVotesRevealedRef = useRef(votesRevealed);
  useEffect(() => {
    // Detect transition from revealed → unrevealed (i.e., new round started)
    if (prevVotesRevealedRef.current && !votesRevealed) {
      setSelectedVote(undefined);
      setSelectedConfidence(undefined);
    }
    prevVotesRevealedRef.current = votesRevealed;
  }, [votesRevealed]);

  // Auto-reveal: bypass permission check since it's triggered by a room setting
  useEffect(() => {
    if (
      allVoted &&
      !votesRevealed &&
      voters.length > 0 &&
      roomSettings.autoReveal
    ) {
      const timer = setTimeout(async () => {
        try {
          await sendEvent(roomId, {
            type: "votes-revealed",
            payload: { revealed: true },
          });
        } catch (error) {
          console.error("Auto-reveal failed:", error);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [allVoted, votesRevealed, voters.length, roomSettings.autoReveal, sendEvent, roomId]);

  const handleLeaveRoom = async () => {
    if (currentUser) {
      await sendEvent(roomId, {
        type: "user-left",
        payload: { id: currentUser.id },
      });
    }
    leaveRoom();
    toast({
      title: "Left room",
      description: "You have left the planning session",
    });
    router.push("/");
  };

  const handleSettingsUpdate = async (
    newDeckType: DeckType,
    newTimerDuration: number | undefined,
    newRoomName: string,
    newSettings: RoomSettings
  ) => {
    // Send to server so all clients get the update
    await sendEvent(roomId, {
      type: "settings-updated",
      payload: {
        settings: newSettings,
        deckType: newDeckType,
        roomName: newRoomName,
        timerDuration: newTimerDuration,
      },
    });

    // Also update localStorage for the recent rooms list
    updateRecentRoom(roomId, {
      deckType: newDeckType,
      timerDuration: newTimerDuration,
      name: newRoomName,
      settings: newSettings,
    });

    setShowSettingsDialog(false);
  };

  const handleJoin = async (name: string, isSpectator: boolean) => {
    setIsJoining(true);
    try {
      setUserName(name);
      const user: Participant = {
        id: crypto.randomUUID(),
        name,
        isSpectator,
      };
      setCurrentUser(user);

      await sendEvent(roomId, {
        type: "user-joined",
        payload: {
          id: user.id,
          name: user.name,
          isSpectator: user.isSpectator,
        },
      });

      // If first person joining, push initial settings from localStorage to server
      if (participants.length === 0) {
        const room = getRecentRooms().find((r) => r.id === roomId);
        if (room) {
          await sendEvent(roomId, {
            type: "settings-updated",
            payload: {
              settings: room.settings || DEFAULT_ROOM_SETTINGS,
              deckType: room.deckType || "fibonacci",
              roomName: room.name || "Planning Poker Session",
              timerDuration: room.timerDuration,
            },
          });
        }
      }

      autoJoinAttemptedRef.current = true;
      setShowJoinDialog(false);
      toast({
        title: "Joined room",
        description: `Welcome to ${roomName}!`,
      });
    } catch (error) {
      console.error("Failed to join room:", error);
      toast({
        title: "Failed to join",
        description: "Could not join the room. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleVote = async (value: string, confidence?: ConfidenceLevel) => {
    if (currentUser?.isSpectator) return;
    setIsVoting(true);
    try {
      setSelectedVote(value);
      setSelectedConfidence(confidence);
      if (currentUser) {
        await sendEvent(roomId, {
          type: "vote-cast",
          payload: { userId: currentUser.id, vote: value, confidence },
        });
        toast({
          title: "Vote cast",
          description: `You voted ${value}${
            confidence ? ` with ${confidence} confidence` : ""
          }`,
        });
      }
    } catch (error) {
      console.error("Failed to cast vote:", error);
      toast({
        title: "Failed to vote",
        description: "Could not cast your vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  const handleRevealVotes = async () => {
    if (!isModerator && !roomSettings.allowOthersToShowEstimates) {
      toast({
        title: "Permission denied",
        description: "Only the moderator can reveal votes",
        variant: "destructive",
      });
      return;
    }
    setIsRevealing(true);
    try {
      await sendEvent(roomId, {
        type: "votes-revealed",
        payload: { revealed: true },
      });
      toast({
        title: "Votes revealed",
        description: "All estimates are now visible",
      });
    } catch (error) {
      console.error("Failed to reveal votes:", error);
      toast({
        title: "Failed to reveal",
        description: "Could not reveal votes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRevealing(false);
    }
  };

  const handleNewRound = async () => {
    if (!isModerator && !roomSettings.allowOthersToDeleteEstimates) {
      toast({
        title: "Permission denied",
        description: "Only the moderator can start a new round",
        variant: "destructive",
      });
      return;
    }
    setIsStartingNewRound(true);
    try {
      setSelectedVote(undefined);
      setSelectedConfidence(undefined);
      await sendEvent(roomId, {
        type: "new-round",
        payload: {},
      });
      if (timerDuration) {
        await sendEvent(roomId, {
          type: "timer-started",
          payload: { duration: timerDuration },
        });
      }
      toast({
        title: "New round started",
        description: "Ready for the next estimation",
      });
    } catch (error) {
      console.error("Failed to start new round:", error);
      toast({
        title: "Failed to start round",
        description: "Could not start a new round. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsStartingNewRound(false);
    }
  };

  const handleNameChange = async (newName: string) => {
    try {
      setUserName(newName);
      if (currentUser) {
        const updatedUser = { ...currentUser, name: newName };
        setCurrentUser(updatedUser);
        await sendEvent(roomId, {
          type: "name-changed",
          payload: { userId: currentUser.id, name: newName },
        });
        toast({
          title: "Name updated",
          description: `Your name is now ${newName}`,
        });
      }
    } catch (error) {
      console.error("Failed to change name:", error);
      toast({
        title: "Failed to update name",
        description: "Could not change your name. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStoryUpdate = async (story: string) => {
    try {
      await sendEvent(roomId, {
        type: "story-updated",
        payload: { story },
      });
    } catch (error) {
      console.error("Failed to update story:", error);
      toast({
        title: "Failed to update story",
        description: "Could not update the story. Please try again.",
        variant: "destructive",
      });
    }
  };

  const results: VoteResult[] = participants
    .filter((p) => !p.isSpectator && p.vote)
    .map((p) => ({
      participant: p.name,
      vote: p.vote!,
      confidence: p.confidence,
    }));

  const canRevealVotes = isModerator || roomSettings.allowOthersToShowEstimates;
  const canStartNewRound =
    isModerator || roomSettings.allowOthersToDeleteEstimates;

  // Auto-join: reconnect existing user or auto-join as room creator
  useEffect(() => {
    if (!isMounted || autoJoinAttemptedRef.current || !roomState || currentUser) return;
    if (!userName) return;

    // Check if the user already exists in the room (e.g., page refresh)
    const existing = roomState.participants.find((p) => p.name === userName);
    if (existing) {
      setCurrentUser(existing);
      // Restore vote selection from server state
      if (existing.vote) {
        setSelectedVote(existing.vote);
        setSelectedConfidence(existing.confidence);
      }
      setShowJoinDialog(false);
      autoJoinAttemptedRef.current = true;
      return;
    }

    // Auto-join only if this user created the room (in their recent rooms) and room is empty
    const isRoomCreator = getRecentRooms().some((r) => r.id === roomId);
    if (roomState.participants.length === 0 && isRoomCreator) {
      autoJoinAttemptedRef.current = true;
      const user: Participant = {
        id: crypto.randomUUID(),
        name: userName,
        isSpectator: false,
      };
      setCurrentUser(user);

      (async () => {
        try {
          await sendEvent(roomId, {
            type: "user-joined",
            payload: { id: user.id, name: user.name, isSpectator: user.isSpectator },
          });

          // Push initial settings from localStorage to server
          const room = getRecentRooms().find((r) => r.id === roomId);
          if (room) {
            await sendEvent(roomId, {
              type: "settings-updated",
              payload: {
                settings: room.settings || DEFAULT_ROOM_SETTINGS,
                deckType: room.deckType || "fibonacci",
                roomName: room.name || "Planning Poker Session",
                timerDuration: room.timerDuration,
              },
            });
          }

          setShowJoinDialog(false);
        } catch (error) {
          console.error("Failed to auto-join:", error);
          setCurrentUser(null);
          autoJoinAttemptedRef.current = false;
        }
      })();
    }
  }, [isMounted, roomState, currentUser, userName, sendEvent, roomId]);

  // Start polling and handle cleanup on unmount
  useEffect(() => {
    joinRoom(roomId);

    return () => {
      // Use ref to get the latest currentUser value (avoids stale closure)
      const user = currentUserRef.current;
      if (user) {
        // Use sendBeacon with Blob for reliable delivery on page unload
        const payload = JSON.stringify({
          roomId,
          event: { type: "user-left", payload: { id: user.id } },
        });
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/socket", blob);
      }
      leaveRoom();
    };
  }, [roomId, joinRoom, leaveRoom]);

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#room-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to room content
      </a>
      <Header
        rightContent={
          userName ? (
            <UserMenu
              userName={userName}
              onNameChange={handleNameChange}
              onLeaveRoom={handleLeaveRoom}
            />
          ) : null
        }
      />

      <JoinDialog
        open={showJoinDialog}
        onJoin={handleJoin}
        isLoading={isJoining}
      />
      <RoomSettingsDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
        currentDeckType={deckType}
        currentTimerDuration={timerDuration}
        currentRoomName={roomName}
        currentSettings={roomSettings}
        onSave={handleSettingsUpdate}
      />

      <main
        id="room-content"
        role="main"
        aria-label="Planning poker room"
        className="flex-1 py-8"
      >
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleLeaveRoom}
              className="mb-4"
              aria-label="Leave room and return to home"
            >
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Leave Room
            </Button>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1
                  className="text-2xl md:text-3xl font-bold"
                  aria-label={`Room name: ${roomName}`}
                >
                  {isMounted ? roomName : "Loading..."}
                </h1>
                <p
                  className="text-muted-foreground"
                  aria-label={`Room ID: ${roomId}`}
                >
                  Room ID: {roomId}
                </p>
              </div>
              <div
                className="flex items-center gap-2"
                role="toolbar"
                aria-label="Room controls"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettingsDialog(true)}
                  aria-label="Open room settings"
                >
                  <Settings className="h-4 w-4 mr-2" aria-hidden="true" />
                  Settings
                </Button>
                <ShareDialog roomId={roomId} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={votesRevealed ? handleNewRound : handleRevealVotes}
                  disabled={
                    votesRevealed
                      ? !canStartNewRound || isStartingNewRound
                      : !canRevealVotes || isRevealing || votedCount === 0
                  }
                  aria-label={
                    votesRevealed
                      ? "Start a new voting round"
                      : votedCount === 0
                      ? "No votes cast yet"
                      : allVoted
                      ? "Reveal all votes"
                      : `Reveal votes (${votedCount}/${voters.length} voted)`
                  }
                  aria-disabled={
                    votesRevealed
                      ? !canStartNewRound || isStartingNewRound
                      : !canRevealVotes || isRevealing || votedCount === 0
                  }
                >
                  {votesRevealed ? (
                    <>
                      <RotateCcw
                        className={`h-4 w-4 mr-2 ${
                          isStartingNewRound ? "animate-spin" : ""
                        }`}
                        aria-hidden="true"
                      />
                      {isStartingNewRound ? "Starting..." : "New Round"}
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
                      {isRevealing ? "Revealing..." : "Reveal Votes"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <StoryInput
                currentStory={currentStory}
                onStoryUpdate={handleStoryUpdate}
                canEdit={true}
              />

              {!votesRevealed && voters.length > 0 && (
                <VotingProgress
                  votedCount={votedCount}
                  totalVoters={voters.length}
                />
              )}

              {timerDuration && roomSettings.showTimer && (
                <Card>
                  <CardContent className="pt-6">
                    <TimerDisplay
                      duration={timerDuration}
                      isActive={timerActive}
                      startedAt={timerStartedAt}
                      onComplete={() => {
                        // Timer expiry bypasses permission check (same as auto-reveal)
                        sendEvent(roomId, {
                          type: "votes-revealed",
                          payload: { revealed: true },
                        });
                      }}
                    />
                  </CardContent>
                </Card>
              )}

              {!currentUser?.isSpectator && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cast Your Vote</CardTitle>
                    <CardDescription>
                      Select your estimate and confidence level for the current
                      user story
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="flex flex-wrap gap-3 justify-center"
                      role="group"
                      aria-label="Voting cards - select your estimate"
                    >
                      {deckValues.map((value) => (
                        <VotingCard
                          key={value}
                          value={value}
                          selected={selectedVote === value}
                          onSelect={(confidence) =>
                            handleVote(value, confidence)
                          }
                          disabled={votesRevealed || isVoting}
                        />
                      ))}
                    </div>
                    {selectedVote && !votesRevealed && (
                      <div
                        className="text-center mt-4 space-y-1"
                        role="status"
                        aria-live="polite"
                      >
                        <p className="text-sm text-muted-foreground">
                          Your vote:{" "}
                          <span className="font-bold text-primary">
                            {selectedVote}
                          </span>
                        </p>
                        {selectedConfidence && (
                          <p className="text-xs text-muted-foreground">
                            Confidence:{" "}
                            <span className="font-medium capitalize">
                              {selectedConfidence}
                            </span>
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {votesRevealed && (
                <ResultsTable
                  results={results}
                  showAverage={roomSettings.showAverage}
                  showMedian={roomSettings.showMedian}
                />
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Participants ({participants.length})</CardTitle>
                  <CardDescription>
                    {voters.length} voter{voters.length !== 1 ? "s" : ""},{" "}
                    {participants.length - voters.length} spectator
                    {participants.length - voters.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent
                  className="space-y-2"
                  role="list"
                  aria-label="Room participants"
                >
                  {participants.map((participant) => (
                    <ParticipantCard
                      key={participant.id}
                      participant={participant}
                      showVote={votesRevealed}
                    />
                  ))}
                  {participants.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No participants yet
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Room Settings</CardTitle>
                </CardHeader>
                <CardContent
                  className="space-y-3 text-sm"
                  role="list"
                  aria-label="Current room settings"
                >
                  <div className="flex justify-between" role="listitem">
                    <span className="text-muted-foreground">Deck Type</span>
                    <span className="font-medium">
                      {DECK_OPTIONS[deckType]?.label || "Fibonacci"}
                    </span>
                  </div>
                  {timerDuration && (
                    <div className="flex justify-between" role="listitem">
                      <span className="text-muted-foreground">Timer</span>
                      <span className="font-medium">{timerDuration}s</span>
                    </div>
                  )}
                  <div className="flex justify-between" role="listitem">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium text-primary">Active</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
