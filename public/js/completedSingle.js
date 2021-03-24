{
    $('.pack-vote-button').on('click', e => {
        
        const $button = $(e.currentTarget)
        const uid = $button.attr('data-u')
        if (!uid)
            window.location = '/user/login'
        const packId = $button.attr('data-rel-id')
        const currentVotes = parseInt( $('#published-pack-upvotes').text())
        if ($button.attr('data-way') === 'upvote') {
            $.get(`/completed/vote/upvote/${packId}`).done(data => {
                const displayUpdatedLikes = data.updatedLikes > 0 ? `+${data.updatedLikes}` : data.updatedLikes
                $('#published-pack-upvotes').text(data.updatedLikes)
                if (data.updatedLikes == currentVotes - 1) {
                    $('#published-pack-upvotes').text(displayUpdatedLikes)
                    $('.upvote .vote-filled').addClass('hidden')
                    $('.upvote .vote-unfilled').removeClass('hidden')
                    $('.downvote .vote-filled').addClass('hidden')
                    $('.downvote .vote-unfilled').removeClass('hidden')
                    return
                }
                $('#published-pack-upvotes').text(displayUpdatedLikes)
                $('.upvote .vote-filled').removeClass('hidden')
                $('.upvote .vote-unfilled').addClass('hidden')
                $('.downvote .vote-filled').addClass('hidden')
                $('.downvote .vote-unfilled').removeClass('hidden')
            })  
           
        } else {
            $.get(`/completed/vote/downvote/${packId}`).done(data => {
                const displayUpdatedLikes = data.updatedLikes > 0 ? `+${data.updatedLikes}` : data.updatedLikes
                if (data.updatedLikes == currentVotes + 1) {
                    $('#published-pack-upvotes').text(displayUpdatedLikes)
                    $('.upvote .vote-filled').addClass('hidden')
                    $('.upvote .vote-unfilled').removeClass('hidden')
                    $('.downvote .vote-filled').addClass('hidden')
                    $('.downvote .vote-unfilled').removeClass('hidden')
                    return
                }
                $('#published-pack-upvotes').text(displayUpdatedLikes)
                $('.upvote .vote-filled').addClass('hidden')
                $('.upvote .vote-unfilled').removeClass('hidden')
                $('.downvote .vote-filled').removeClass('hidden')
                $('.downvote .vote-unfilled').addClass('hidden')
            })
           
        }
    })
}