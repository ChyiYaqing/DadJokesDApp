"use client";

import { useWallet } from "@/hooks/useWallet";

import ConnectButton from "@/components/ConnectButton";

import React, { useState, useEffect } from "react";
import { ConnectWalletClient, ConnectPublicClient } from "@/lib/client";
import { getContract } from "viem";
import dadJokesABI from "@/lib/dadJokesABI.json";

import { useVote } from "@/hooks/useVote";
import RewardSection from "@/components/RewardSection";

import { useWithdraw } from "@/hooks/useWithdraw";
import WithdrawSection from "@/components/WithdrawSection";

import { useSubmitJoke } from "@/hooks/useSubmitJoke";
import JokeModal from "@/components/JokeModal";

// Component to display the wallet status (connected or disconnected)
export default function WalletButton({ index }) {
    const [publicClient, setPublicClient] = useState(null);
    const [walletClient, setWalletClient] = useState(null);
    const [dadJokesContract, setDadJokesContract] = useState(null);

    const { address, balance, handleClick } = useWallet(dadJokesContract);
    const { handleVote } = useVote(dadJokesContract, walletClient, publicClient);
    const { handleWithdraw } = useWithdraw(dadJokesContract, walletClient, publicClient);

    const { isModalOpen, setIsModalOpen, handleSubmit } = useSubmitJoke(publicClient, walletClient, dadJokesContract);

    const [setup, setSetup] = useState("");
    const [punchline, setPunchline] = useState("");

    useEffect(() => {
        const initializeClients = async () => {
            try {
                const publicClient = await ConnectPublicClient();
                const walletClient = await ConnectWalletClient();

                setPublicClient(publicClient);
                setWalletClient(walletClient);
            } catch (error) {
                console.error("Error initializing clients:", error);
            }
        };

        initializeClients();
    }, []);

    useEffect(() => {
        if (publicClient && walletClient) {
            const dadJokesContract = getContract({
                address: "0x2683167d86c33B45cc05ae94a834a29E967Ece70",
                abi: dadJokesABI,
                client: { public: publicClient, wallet: walletClient },
            });

            setDadJokesContract(dadJokesContract);
        }
    }, [publicClient, walletClient]);

    if (!address) {
        // If no address is provided, display "Disconnected" status
        return <ConnectButton handleClick={handleClick} />;
    }

    return (
        <>
            <RewardSection index={index} handleVote={handleVote} />
            <div className="mt-6 flex items-center w-full bg-gray-800 bg-opacity-25 p-4 rounded">
                <div className="flex items-center justify-center w-full">
                    <WithdrawSection handleWithdraw={handleWithdraw} balance={balance} />
                    <button
                        className="bg-primaryDark text-primaryLight font-sans px-4 py-2 rounded"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Add Joke
                    </button>
                </div>
                <JokeModal
                    {...{
                        isModalOpen,
                        setIsModalOpen,
                        handleSubmit,
                        setup,
                        setSetup,
                        punchline,
                        setPunchline,
                    }}
                />
            </div>
        </>
    );
}