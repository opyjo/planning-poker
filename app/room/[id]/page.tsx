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
  type Participant,
  type VoteResult,
  type DeckType,
  type ConfidenceLevel,
  type RoomSettings,
  DEFAULT_ROOM_SETTINGS,
} from "@/lib/types";
import { getRecentRooms, updateRecentRoom } from "@/lib/storage";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const { userName, setUserName } = useUser();
  const { roomState, sendEvent, joinRoom, leaveRoom } = useSocket();
  const { toast } = useToast();
  const roomId = params.id as string;

  const [showJoinDialog, setShowJoinDialog] = useState(true);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<Participant | null>(null);
  const [selectedVote, setSelectedVote] = useState<string | undefined>();
  const [selectedConfidence, setSelectedConfidence] = useState<
    ConfidenceLevel | undefined
  >();
  const [moderatorId, setModeratorId] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isStartingNewRound, setIsStartingNewRound] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [deckType, setDeckType] = useState<DeckType>("fibonacci");
  const [timerDuration, setTimerDuration] = useState<number | undefined>();
  const [roomSettings, setRoomSettings] = useState<RoomSettings>(
    DEFAULT_ROOM_SETTINGS
  );
  const [isMounted, setIsMounted] = useState(false);
  const autoJoinAttemptedRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
    const room = getRecentRooms().find((r) => r.id === roomId);
    if (room) {
      setRoomName(room.name || "Planning Poker Session");
      setDeckType(room.deckType || "fibonacci");
      setTimerDuration(room.timerDuration);
      setRoomSettings(room.settings || DEFAULT_ROOM_SETTINGS);
    } else {
      setRoomName("Planning Poker Session");
    }
  }, [roomId]);

  const deckValues = DECK_OPTIONS[deckType].values;

  const participants = roomState?.participants || [];
  const votesRevealed = roomState?.votesRevealed || false;
  const timerActive = roomState?.timerActive || false;
  const currentStory = roomState?.currentStory;

  const voters = participants.filter((p) => !p.isSpectator);
  const votedCount = voters.filter((p) => p.vote).length;
  const allVoted = voters.length > 0 && voters.every((p) => p.vote);

  const isModerator = currentUser?.id === moderatorId;

  useEffect(() => {
    if (
      allVoted &&
      !votesRevealed &&
      voters.length > 0 &&
      roomSettings.autoReveal
    ) {
      const timer = setTimeout(() => {
        handleRevealVotes();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [allVoted, votesRevealed, voters.length, roomSettings.autoReveal]);

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

  const handleSettingsUpdate = (
    newDeckType: DeckType,
    newTimerDuration: number | undefined,
    newRoomName: string,
    newSettings: RoomSettings
  ) => {
    setDeckType(newDeckType);
    setTimerDuration(newTimerDuration);
    setRoomName(newRoomName);
    setRoomSettings(newSettings);

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
        id: Math.random().toString(36).substring(2, 9),
        name,
        isSpectator,
      };
      setCurrentUser(user);
      if (participants.length === 0) {
        setModeratorId(user.id);
      }
      await sendEvent(roomId, {
        type: "user-joined",
        payload: {
          id: user.id,
          name: user.name,
          isSpectator: user.isSpectator,
        },
      });
      setShowJoinDialog(false);
      toast({
        title: "Joined room",
        description: `Welcome to ${roomName}!`,
      });
    } catch (error) {
      console.error("[v0] Failed to join room:", error);
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
      console.error("[v0] Failed to cast vote:", error);
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
      console.error("[v0] Failed to reveal votes:", error);
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
      console.error("[v0] Failed to start new round:", error);
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
      console.error("[v0] Failed to change name:", error);
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
      console.error("[v0] Failed to update story:", error);
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

  useEffect(() => {
    if (!isMounted || autoJoinAttemptedRef.current) return;

    const autoJoin = async () => {
      // Check if user should auto-join (has name but not in participants yet)
      if (userName && participants.length === 0 && !currentUser) {
        autoJoinAttemptedRef.current = true;
        const user: Participant = {
          id: Math.random().toString(36).substring(2, 9),
          name: userName,
          isSpectator: false,
        };
        setCurrentUser(user);
        setModeratorId(user.id);
        try {
          await sendEvent(roomId, {
            type: "user-joined",
            payload: {
              id: user.id,
              name: user.name,
              isSpectator: user.isSpectator,
            },
          });
          setShowJoinDialog(false);
        } catch (error) {
          console.error("[v0] Failed to auto-join:", error);
          setCurrentUser(null);
          setModeratorId(null);
          autoJoinAttemptedRef.current = false;
        }
      } else if (userName && participants.length > 0 && !currentUser) {
        const existingParticipant = participants.find(
          (p) => p.name === userName
        );
        if (existingParticipant) {
          setCurrentUser(existingParticipant);
          setShowJoinDialog(false);
          if (participants[0].id === existingParticipant.id) {
            setModeratorId(existingParticipant.id);
          }
          autoJoinAttemptedRef.current = true;
        }
      }
    };

    autoJoin();
  }, [
    userName,
    participants.length,
    roomId,
    isMounted,
    currentUser,
    sendEvent,
  ]);

  useEffect(() => {
    joinRoom(roomId);

    return () => {
      // Only send leave event if user actually joined
      if (currentUser && autoJoinAttemptedRef.current) {
        sendEvent(roomId, {
          type: "user-left",
          payload: { id: currentUser.id },
        }).catch((error) => {
          console.error("[v0] Failed to send leave event:", error);
        });
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
                      onComplete={handleRevealVotes}
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
                      {DECK_OPTIONS[deckType].label}
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
