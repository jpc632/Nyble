const Blockchain = require('../lib/blockchain');
const Block = require('../lib/blockchain/block');

describe('Blockchain', () => {
    let blockchain, newChain, originalChain;

    beforeEach(() => {
        blockchain  = new Blockchain();
        newChain = new Blockchain();

        originalChain = blockchain.chain;
    });

    it('contains a `chain` Array instance', () => {
        expect(blockchain.chain instanceof Array).toBeTruthy();
    });

    it('starts with a genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block to the chain', () => {
        const newData = 'foo-bar';
        blockchain.addBlock({ data : newData });

        expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData);
    });

    describe('isValidChain()', () => {
        describe('when the chain does not start with the genesis block', () => {
            it('returns false', () => {
                blockchain.chain[0] = { data : 'fake-data' };

                expect(Blockchain.isValidChain(blockchain.chain)).toBeFalsy();
            });
        });

        describe('when the chain does start with the genesis block and has multiple blocks', () => {
            beforeEach(() => {
                blockchain.addBlock({ data : 'real' });
            });

            describe('and `previousHash` reference has changed', () => {
                it('returns false', () => {
                    blockchain.getLatestBlock().previousHash = 'tampered';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBeFalsy();
                });
            });
            
            describe('and the chain contains a block with an invalid field', () => {
                it('returns false', () => {
                    blockchain.getLatestBlock().data = 'bad-data';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBeFalsy();
                });
            });

            describe('and the chain does not contain an invalid blocks', () => {
                it('returns true', () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBeTruthy();
                });
            });
        });
    });

    describe('replaceChain()', () => {
        let errorMock, logMock;

        beforeEach(() => {
            errorMock = jest.fn();
            logMock = jest.fn();

            global.console.error = errorMock;
            global.console.log = logMock;
        });

        describe('when the new chain is not longer', () => {
            beforeEach(() => {
                newChain[0] = { new: 'chain'};
                blockchain.replaceChain(newChain.chain);
            });

            it('does not replace the chain', () => {
                expect(blockchain.chain).toEqual(originalChain);
            });

            // it('logs an error', () => {
            //     expect(errorMock).toHaveBeenCalled(); 
            // });
        });

        describe('when the new chain is longer', () => {
            beforeEach(() => {
                newChain.addBlock({ data : 'real' });
            });

            describe('and the chain is invalid', () => {
                beforeEach(() => {
                    newChain.addBlock({ data : 'real' });
                    newChain.getLatestBlock().hash = 'fake-hash';
                    blockchain.replaceChain(newChain.chain);
                 });

                it('does not replace the chain', () => {
                    expect(blockchain.chain).toEqual(originalChain);
                });

                it('logs an error', () => {
                    expect(errorMock).toHaveBeenCalled(); 
                });
            });

            describe('and the chain is valid', () => {
                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain);
                });
                
                it('replaces the chain', () => {
                    expect(blockchain.chain).toEqual(newChain.chain);
                });

                it('logs about the chain replacement', () => {
                    expect(logMock).toHaveBeenCalled();
                });
            });
        });
    });
});